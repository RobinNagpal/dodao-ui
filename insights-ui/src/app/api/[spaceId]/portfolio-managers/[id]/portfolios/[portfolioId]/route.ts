import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withErrorHandlingV2, withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Portfolio } from '@/types/portfolio';
import { UpdatePortfolioRequest } from '@/types/portfolio';
import { TickerV1, TickerV1CachedScore } from '@prisma/client';
import { revalidatePortfolioProfileTag } from '@/utils/ticker-v1-cache-utils';

// GET /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId] - Get a specific portfolio (public)
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string; portfolioId: string }> }): Promise<{ portfolio: Portfolio }> {
  const { id: profileId, portfolioId } = await params;

  const portfolio = await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: {
        include: {
          user: true,
        },
      },
      portfolioTickers: {
        include: {
          ticker: {
            include: {
              cachedScoreEntry: true,
            },
          },
          tags: true,
          lists: true,
        },
        orderBy: {
          allocation: 'desc',
        },
      },
    },
  });

  // Populate competitors and alternatives as full ticker objects
  // First, collect all unique ticker IDs from competitors and alternatives
  const allTickerIds = new Set<string>();
  portfolio.portfolioTickers.forEach((pt) => {
    const ptWithFields = pt as typeof pt & { competitors: string[]; alternatives: string[] };
    if (ptWithFields.competitors) {
      ptWithFields.competitors.forEach((id) => allTickerIds.add(id));
    }
    if (ptWithFields.alternatives) {
      ptWithFields.alternatives.forEach((id) => allTickerIds.add(id));
    }
  });

  // Batch fetch all competitor and alternative tickers in one query
  const tickerMap = new Map<string, TickerV1 & { cachedScoreEntry?: TickerV1CachedScore | null }>();
  if (allTickerIds.size > 0) {
    const tickers = await prisma.tickerV1.findMany({
      where: {
        id: { in: Array.from(allTickerIds) },
        spaceId: KoalaGainsSpaceId,
      },
      include: {
        cachedScoreEntry: true,
      },
    });
    tickers.forEach((ticker) => tickerMap.set(ticker.id, ticker));
  }

  // Now map the portfolio tickers with resolved competitors and alternatives
  const portfolioWithCompetitors = {
    ...portfolio,
    portfolioTickers: portfolio.portfolioTickers.map((pt) => {
      const ptWithFields = pt as typeof pt & { competitors: string[]; alternatives: string[] };

      const competitors = ptWithFields.competitors
        ? ptWithFields.competitors
            .map((id) => tickerMap.get(id))
            .filter((ticker): ticker is TickerV1 & { cachedScoreEntry?: TickerV1CachedScore | null } => ticker !== undefined)
        : [];

      const alternatives = ptWithFields.alternatives
        ? ptWithFields.alternatives
            .map((id) => tickerMap.get(id))
            .filter((ticker): ticker is TickerV1 & { cachedScoreEntry?: TickerV1CachedScore | null } => ticker !== undefined)
        : [];

      return {
        ...pt,
        competitorsConsidered: competitors,
        betterAlternatives: alternatives,
      };
    }),
  };

  return { portfolio: portfolioWithCompetitors };
}

// PUT /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId] - Update a portfolio (owner only)
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<Portfolio> {
  const { id: profileId, portfolioId } = await params;
  const { userId } = userContext;
  const body: UpdatePortfolioRequest = await req.json();

  // Verify the portfolio belongs to the user
  const existingPortfolio = await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (existingPortfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Access denied: You do not own this portfolio');
  }

  // Update the portfolio
  const updatedPortfolio = await prisma.portfolio.update({
    where: {
      id: portfolioId,
    },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.detailedDescription !== undefined && { detailedDescription: body.detailedDescription }),
      updatedBy: userId,
    },
    include: {
      portfolioTickers: {
        include: {
          ticker: {
            include: {
              cachedScoreEntry: true,
            },
          },
          tags: true,
          lists: true,
        },
      },
    },
  });

  // Revalidate the portfolio manager profile cache
  revalidatePortfolioProfileTag(profileId);

  return updatedPortfolio;
}

// DELETE /api/[spaceId]/portfolio-managers/[id]/portfolios/[portfolioId] - Delete a portfolio (owner only)
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
): Promise<{ success: boolean }> {
  const { id: profileId, portfolioId } = await params;
  const { userId } = userContext;

  // Verify the portfolio belongs to the user
  const existingPortfolio = await prisma.portfolio.findFirstOrThrow({
    where: {
      id: portfolioId,
      portfolioManagerProfileId: profileId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
    },
  });

  if (existingPortfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Access denied: You do not own this portfolio');
  }

  // Delete the portfolio (cascade will delete portfolio tickers)
  await prisma.portfolio.delete({
    where: {
      id: portfolioId,
    },
  });

  // Revalidate the portfolio manager profile cache
  revalidatePortfolioProfileTag(profileId);

  return { success: true };
}

export const GET = withErrorHandlingV2<{ portfolio: Portfolio }>(getHandler);
export const PUT = withLoggedInUser<Portfolio>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
