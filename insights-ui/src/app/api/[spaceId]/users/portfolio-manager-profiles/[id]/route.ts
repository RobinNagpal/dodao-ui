import { prisma } from '@/prisma';
import { PortfolioManagerProfile, Portfolio, PortfolioTicker, User, TickerV1CachedScore } from '@prisma/client';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withLoggedInUser, withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import {
  UpdatePortfolioManagerProfileRequest,
  PortfolioManagerProfilewithPortfoliosAndUser,
  IndustryByCountry,
  FavouriteWithFullDetails,
  NoteWithFullDetails,
} from '@/types/portfolio';
import { revalidatePortfolioProfileTag, revalidatePortfolioManagersByCountryTag, revalidatePortfolioManagersByTypeTag } from '@/utils/ticker-v1-cache-utils';
import { getCountryByExchange, toExchange, SupportedCountries } from '@/utils/countryExchangeUtils';

// GET /api/[spaceId]/users/portfolio-manager-profiles/[id] - Get a portfolio manager profile by ID (for public viewing)
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ portfolioManagerProfile: PortfolioManagerProfilewithPortfoliosAndUser | null }> {
  const { id } = await params;

  const portfolioManagerProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      user: true,
      portfolios: {
        include: {
          portfolioTickers: {
            include: {
              ticker: {
                include: {
                  cachedScoreEntry: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // Fetch industries by country for favorites and notes
  const userId = portfolioManagerProfile.userId;

  // Get all favorites and notes with full ticker details
  const [favorites, notes] = await Promise.all([
    prisma.favouriteTicker.findMany({
      where: {
        userId: userId,
        spaceId: KoalaGainsSpaceId,
      },
      include: {
        ticker: {
          include: {
            industry: true,
            subIndustry: true,
            cachedScoreEntry: true,
          },
        },
        tags: true,
        lists: true,
      },
    }),
    prisma.tickerV1Notes.findMany({
      where: {
        userId: userId,
        spaceId: KoalaGainsSpaceId,
      },
      include: {
        ticker: {
          include: {
            industry: true,
            subIndustry: true,
            cachedScoreEntry: true,
          },
        },
      },
    }),
  ]);

  // Process favorites to include competitors and better alternatives
  const processedFavorites = await Promise.all(
    favorites.map(async (favorite) => {
      let competitorsConsidered: Array<{
        id: string;
        symbol: string;
        name: string;
        exchange: string;
        cachedScoreEntry: TickerV1CachedScore | null;
      }> = [];
      let betterAlternatives: Array<{
        id: string;
        symbol: string;
        name: string;
        exchange: string;
        cachedScoreEntry: TickerV1CachedScore | null;
      }> = [];

      if (favorite.competitorsConsidered?.length > 0) {
        const competitors = await prisma.tickerV1.findMany({
          where: {
            id: { in: favorite.competitorsConsidered },
          },
          include: {
            cachedScoreEntry: true,
          },
        });
        competitorsConsidered = competitors;
      }

      if (favorite.betterAlternatives?.length > 0) {
        const alternatives = await prisma.tickerV1.findMany({
          where: {
            id: { in: favorite.betterAlternatives },
          },
          include: {
            cachedScoreEntry: true,
          },
        });
        betterAlternatives = alternatives;
      }

      return {
        ...favorite,
        competitorsConsidered,
        betterAlternatives,
      };
    })
  );

  // Combine unique ticker IDs for industry grouping
  const tickerIds = new Set([...processedFavorites.map((f) => f.tickerId), ...notes.map((n) => n.tickerId)]);

  if (tickerIds.size > 0) {
    // Group by industry + country
    const industryMap = new Map<
      string,
      {
        industry: any;
        country: SupportedCountries;
        favoriteCount: number;
        notesCount: number;
      }
    >();

    const favoriteTickerIds = new Set(processedFavorites.map((f) => f.tickerId));
    const notesTickerIds = new Set(notes.map((n) => n.tickerId));

    // Use the already fetched tickers from favorites and notes
    const allTickers = [...processedFavorites.map((f) => f.ticker), ...notes.map((n) => n.ticker)];
    const uniqueTickers = new Map(allTickers.map((t) => [t.id, t]));

    uniqueTickers.forEach((ticker) => {
      if (!ticker.industry) return;

      const exchange = toExchange(ticker.exchange);
      const country = getCountryByExchange(exchange);
      const key = `${ticker.industryKey}-${country}`;

      const existing = industryMap.get(key);
      const isFavorite = favoriteTickerIds.has(ticker.id);
      const hasNotes = notesTickerIds.has(ticker.id);

      if (existing) {
        if (isFavorite) existing.favoriteCount++;
        if (hasNotes) existing.notesCount++;
      } else {
        industryMap.set(key, {
          industry: ticker.industry,
          country,
          favoriteCount: isFavorite ? 1 : 0,
          notesCount: hasNotes ? 1 : 0,
        });
      }
    });

    // Convert to array and add totalCount
    const industriesByCountry: IndustryByCountry[] = Array.from(industryMap.values())
      .map((item) => ({
        industry: item.industry,
        country: item.country,
        favoriteCount: item.favoriteCount,
        notesCount: item.notesCount,
        totalCount: item.favoriteCount + item.notesCount,
      }))
      .sort((a, b) => {
        // Sort by industry name, then by country
        const nameA = a.industry?.industryName || '';
        const nameB = b.industry?.industryName || '';
        const nameCompare = nameA.localeCompare(nameB);
        if (nameCompare !== 0) return nameCompare;
        return a.country.localeCompare(b.country);
      });

    return {
      portfolioManagerProfile: {
        ...portfolioManagerProfile,
        industriesByCountry,
        allFavorites: processedFavorites as FavouriteWithFullDetails[],
        allNotes: notes as NoteWithFullDetails[],
      },
    };
  }

  return {
    portfolioManagerProfile: {
      ...portfolioManagerProfile,
      allFavorites: [],
      allNotes: [],
    },
  };
}

// PUT /api/[spaceId]/users/portfolio-manager-profiles/[id] - Update a portfolio manager profile by ID (both admin and user can update)
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<PortfolioManagerProfile> {
  const { id } = await params;
  const body: UpdatePortfolioManagerProfileRequest = await req.json();

  // Find the profile
  const existingProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
  });

  // Update the profile
  const updatedProfile = await prisma.portfolioManagerProfile.update({
    where: {
      id: id,
    },
    data: {
      ...(body.headline !== undefined && { headline: body.headline }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.detailedDescription !== undefined && { detailedDescription: body.detailedDescription }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.managerType !== undefined && { managerType: body.managerType }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      ...(body.profileImageUrl !== undefined && { profileImageUrl: body.profileImageUrl }),
      updatedBy: userContext.userId,
    },
  });

  // Revalidate the portfolio manager profile cache
  revalidatePortfolioProfileTag(id);

  if (body.country) {
    revalidatePortfolioManagersByCountryTag(body.country);
  }

  return updatedProfile;
}

// DELETE /api/[spaceId]/users/portfolio-manager-profiles/[id] - Delete a portfolio manager profile by ID (only admin can delete)
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id } = await params;

  // Find the profile
  const existingProfile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
  });

  await prisma.portfolioManagerProfile.delete({
    where: {
      id: id,
    },
  });

  if (existingProfile.managerType) {
    revalidatePortfolioManagersByTypeTag(existingProfile.managerType);
  }

  return { success: true };
}

export const GET = withErrorHandlingV2<{ portfolioManagerProfile: PortfolioManagerProfilewithPortfoliosAndUser | null }>(getHandler);
export const PUT = withLoggedInUser<PortfolioManagerProfile>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
