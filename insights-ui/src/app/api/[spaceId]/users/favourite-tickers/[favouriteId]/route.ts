import { NextRequest } from 'next/server';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { FavouriteTickerResponse, UpdateFavouriteTickerRequest } from '@/types/ticker-user';
import { revalidatePortfolioProfileIfExists } from '@/utils/cache-actions';
import { verifyUserRecordOwnership } from '@/utils/user-record-verification-utils';

// PUT /api/favourite-tickers/[favouriteId] - Update a single favourite ticker
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ favouriteId: string }> }
): Promise<FavouriteTickerResponse> {
  const { userId } = userContext;
  const { favouriteId } = await params;

  // Verify the favourite belongs to the user
  const existingFavourite = await verifyUserRecordOwnership(
    prisma.favouriteTicker,
    favouriteId,
    userId,
    'Favourite not found or you do not have permission to update it',
    {
      tags: true,
      lists: true,
    }
  );

  const updateBody: UpdateFavouriteTickerRequest = await req.json();

  // Update the favourite ticker
  const updatedFavourite = await prisma.favouriteTicker.update({
    where: {
      id: favouriteId,
    },
    data: {
      myNotes: updateBody.myNotes !== undefined ? updateBody.myNotes : undefined,
      myScore: updateBody.myScore !== undefined ? updateBody.myScore : undefined,
      competitorsConsidered: updateBody.competitorsConsidered !== undefined ? updateBody.competitorsConsidered : undefined,
      betterAlternatives: updateBody.betterAlternatives !== undefined ? updateBody.betterAlternatives : undefined,
      tags:
        updateBody.tagIds !== undefined
          ? {
              disconnect: existingFavourite.tags.map((tag: { id: string }) => ({ id: tag.id })),
              connect: updateBody.tagIds.map((tagId: string) => ({ id: tagId })),
            }
          : undefined,
      lists:
        updateBody.listIds !== undefined
          ? {
              disconnect: existingFavourite.lists.map((list: { id: string }) => ({ id: list.id })),
              connect: updateBody.listIds.map((listId: string) => ({ id: listId })),
            }
          : undefined,
    },
    include: {
      ticker: {
        include: {
          cachedScoreEntry: true,
        },
      },
      tags: true,
      lists: true,
    },
  });

  // Fetch competitor and alternative ticker details
  const favWithFields = updatedFavourite as typeof updatedFavourite & { competitorsConsidered: string[]; betterAlternatives: string[] };

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

  const enhancedFavourite = {
    ...updatedFavourite,
    competitorsConsidered: competitors,
    betterAlternatives: alternatives,
  };

  return enhancedFavourite as unknown as FavouriteTickerResponse;
}

// DELETE /api/favourite-tickers/[favouriteId] - Remove a favourite ticker
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ favouriteId: string }> }
): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { favouriteId } = await params;

  // Verify the favourite belongs to the user
  await verifyUserRecordOwnership(prisma.favouriteTicker, favouriteId, userId, 'Favourite not found or you do not have permission to delete it');

  await prisma.favouriteTicker.delete({
    where: {
      id: favouriteId,
    },
  });

  // Revalidate portfolio profile if user has one
  await revalidatePortfolioProfileIfExists(userId);

  return { success: true };
}

export const PUT = withLoggedInUser<FavouriteTickerResponse>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
