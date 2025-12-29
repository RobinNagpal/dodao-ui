import { prisma } from '@/prisma';
import { CreateFavouriteTickerRequest, FavouriteTickerResponse, FavouriteTickersResponse, UpdateFavouriteTickerRequest } from '@/types/ticker-user';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { revalidatePortfolioProfileIfExists } from '@/utils/cache-actions';

// GET /api/favourite-tickers - Get all favourite tickers for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FavouriteTickersResponse> {
  const { userId } = userContext;

  const favouriteTickers = await prisma.favouriteTicker.findMany({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      ticker: {
        include: {
          cachedScoreEntry: true,
          categoryAnalysisResults: {
            where: {
              categoryKey: TickerAnalysisCategory.BusinessAndMoat,
            },
            include: {
              factorResults: {
                include: {
                  analysisCategoryFactor: true,
                },
              },
            },
          },
        },
      },
      tags: true,
      lists: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch competitor and alternative ticker details
  const enhancedFavouriteTickers = await Promise.all(
    favouriteTickers.map(async (fav) => {
      // Type assertion for fields that exist but aren't in Prisma types
      const favWithFields = fav as typeof fav & { competitorsConsidered: string[]; betterAlternatives: string[] };

      const competitors =
        favWithFields.competitorsConsidered.length > 0
          ? await prisma.tickerV1.findMany({
              where: {
                id: { in: favWithFields.competitorsConsidered },
                spaceId: KoalaGainsSpaceId,
              },
              include: {
                cachedScoreEntry: true,
              },
            })
          : [];

      const alternatives =
        favWithFields.betterAlternatives.length > 0
          ? await prisma.tickerV1.findMany({
              where: {
                id: { in: favWithFields.betterAlternatives },
                spaceId: KoalaGainsSpaceId,
              },
              include: {
                cachedScoreEntry: true,
              },
            })
          : [];

      return {
        ...fav,
        competitorsConsidered: competitors,
        betterAlternatives: alternatives,
      };
    })
  );

  return { favouriteTickers: enhancedFavouriteTickers as unknown as FavouriteTickerResponse[] };
}

// POST /api/favourite-tickers - Add a ticker to favourites
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FavouriteTickerResponse> {
  const { userId } = userContext;
  const body: CreateFavouriteTickerRequest = await req.json();

  // Check if the ticker exists
  const ticker = await prisma.tickerV1.findUnique({
    where: {
      id: body.tickerId,
    },
  });

  if (!ticker) {
    throw new Error('Ticker not found');
  }

  // Check if the ticker is already in favourites
  const existingFavourite = await prisma.favouriteTicker.findFirst({
    where: {
      userId: userId,
      tickerId: body.tickerId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (existingFavourite) {
    throw new Error('Ticker is already in favourites');
  }

  // Create the favourite ticker
  const favouriteTicker = await prisma.favouriteTicker.create({
    data: {
      userId: userId,
      tickerId: body.tickerId,
      spaceId: KoalaGainsSpaceId,
      myNotes: body.myNotes,
      myScore: body.myScore,
      competitorsConsidered: body.competitorsConsidered || [],
      betterAlternatives: body.betterAlternatives || [],
      createdBy: userId,
      tags:
        body.tagIds && body.tagIds.length > 0
          ? {
              connect: body.tagIds.map((tagId) => ({ id: tagId })),
            }
          : undefined,
      lists:
        body.listIds && body.listIds.length > 0
          ? {
              connect: body.listIds.map((listId) => ({ id: listId })),
            }
          : undefined,
    },
    include: {
      ticker: true,
      tags: true,
      lists: true,
    },
  });

  // Revalidate portfolio profile if user has one
  await revalidatePortfolioProfileIfExists(userId);

  return favouriteTicker as unknown as FavouriteTickerResponse;
}

// PUT /api/favourite-tickers - Bulk update favourite tickers
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const body = await req.json();

  // This endpoint only handles bulk updates
  if (!body.favouriteIds || !Array.isArray(body.favouriteIds)) {
    throw new Error('This endpoint only supports bulk updates. Use /api/favourite-tickers/[favouriteId] for single updates.');
  }

  const { favouriteIds, mode } = body;

  if (!favouriteIds || favouriteIds.length === 0) {
    throw new Error('Favourite IDs are required');
  }

  // Verify all favourites belong to the user
  const existingFavourites = await prisma.favouriteTicker.findMany({
    where: {
      id: { in: favouriteIds },
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      tags: true,
      lists: true,
    },
  });

  if (existingFavourites.length !== favouriteIds.length) {
    throw new Error('Some favourites not found or you do not have permission to update them');
  }

  // Determine if updating tags or lists
  if (body.tagIds && Array.isArray(body.tagIds)) {
    // Bulk update tags
    const { tagIds } = body;

    if (tagIds.length === 0) {
      throw new Error('Tag IDs are required');
    }

    for (const favourite of existingFavourites) {
      if (mode === 'replace') {
        // Disconnect all existing tags and connect new ones
        await prisma.favouriteTicker.update({
          where: {
            id: favourite.id,
          },
          data: {
            tags: {
              set: tagIds.map((tagId: string) => ({ id: tagId })),
            },
          },
        });
      } else if (mode === 'add') {
        // Add new tags to existing ones (avoid duplicates)
        const existingTagIds = favourite.tags.map((tag) => tag.id);
        const newTagIds = tagIds.filter((tagId: string) => !existingTagIds.includes(tagId));

        if (newTagIds.length > 0) {
          await prisma.favouriteTicker.update({
            where: {
              id: favourite.id,
            },
            data: {
              tags: {
                connect: newTagIds.map((tagId: string) => ({ id: tagId })),
              },
            },
          });
        }
      }
    }
  } else if (body.listIds && Array.isArray(body.listIds)) {
    // Bulk update lists
    const { listIds } = body;

    if (listIds.length === 0) {
      throw new Error('List IDs are required');
    }

    for (const favourite of existingFavourites) {
      if (mode === 'replace') {
        // Disconnect all existing lists and connect new ones
        await prisma.favouriteTicker.update({
          where: {
            id: favourite.id,
          },
          data: {
            lists: {
              set: listIds.map((listId: string) => ({ id: listId })),
            },
          },
        });
      } else if (mode === 'add') {
        // Add new lists to existing ones (avoid duplicates)
        const existingListIds = favourite.lists.map((list) => list.id);
        const newListIds = listIds.filter((listId: string) => !existingListIds.includes(listId));

        if (newListIds.length > 0) {
          await prisma.favouriteTicker.update({
            where: {
              id: favourite.id,
            },
            data: {
              lists: {
                connect: newListIds.map((listId: string) => ({ id: listId })),
              },
            },
          });
        }
      }
    }
  } else {
    throw new Error('Either tagIds or listIds must be provided for bulk update');
  }

  return { success: true };
}

export const GET = withLoggedInUser<FavouriteTickersResponse>(getHandler);
export const POST = withLoggedInUser<FavouriteTickerResponse>(postHandler);
export const PUT = withLoggedInUser<{ success: boolean }>(putHandler);
