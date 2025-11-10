import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { CreateFavouriteTickerRequest, FavouriteTickerResponse, FavouriteTickersResponse, UpdateFavouriteTickerRequest } from '@/types/ticker-user';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

// GET /api/favourite-tickers - Get all favourite tickers for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FavouriteTickersResponse> {
  const { userId } = userContext;

  const favouriteTickers = await prisma.favouriteTicker.findMany({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      ticker: true,
      tags: true,
      lists: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { favouriteTickers: favouriteTickers as unknown as FavouriteTickerResponse[] };
}

// POST /api/favourite-tickers - Add a ticker to favourites
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FavouriteTickerResponse> {
  const { userId } = userContext;
  const body: CreateFavouriteTickerRequest = await req.json();

  console.log('body', body);

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

  return favouriteTicker as unknown as FavouriteTickerResponse;
}

// PUT /api/favourite-tickers?id={favouriteId} - Update a favourite ticker
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FavouriteTickerResponse> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const favouriteId = searchParams.get('id');

  if (!favouriteId) {
    throw new Error('Favourite ID is required');
  }

  // Verify the favourite belongs to the user
  const existingFavourite = await prisma.favouriteTicker.findFirst({
    where: {
      id: favouriteId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      tags: true,
      lists: true,
    },
  });

  if (!existingFavourite) {
    throw new Error('Favourite not found or you do not have permission to update it');
  }

  const body: UpdateFavouriteTickerRequest = await req.json();

  // Update the favourite ticker
  const updatedFavourite = await prisma.favouriteTicker.update({
    where: {
      id: favouriteId,
    },
    data: {
      myNotes: body.myNotes !== undefined ? body.myNotes : undefined,
      myScore: body.myScore !== undefined ? body.myScore : undefined,
      tags:
        body.tagIds !== undefined
          ? {
              disconnect: existingFavourite.tags.map((tag: { id: string }) => ({ id: tag.id })),
              connect: body.tagIds.map((tagId: string) => ({ id: tagId })),
            }
          : undefined,
      lists:
        body.listIds !== undefined
          ? {
              disconnect: existingFavourite.lists.map((list: { id: string }) => ({ id: list.id })),
              connect: body.listIds.map((listId: string) => ({ id: listId })),
            }
          : undefined,
    },
    include: {
      ticker: true,
      tags: true,
      lists: true,
    },
  });

  return updatedFavourite as unknown as FavouriteTickerResponse;
}

// DELETE /api/favourite-tickers?id={favouriteId} - Remove a ticker from favourites
async function deleteHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const favouriteId = searchParams.get('id');

  if (!favouriteId) {
    throw new Error('Favourite ID is required');
  }

  // Verify the favourite belongs to the user
  const existingFavourite = await prisma.favouriteTicker.findFirst({
    where: {
      id: favouriteId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!existingFavourite) {
    throw new Error('Favourite not found or you do not have permission to delete it');
  }

  await prisma.favouriteTicker.delete({
    where: {
      id: favouriteId,
    },
  });

  return { success: true };
}

export const GET = withLoggedInUser<FavouriteTickersResponse>(getHandler);
export const POST = withLoggedInUser<FavouriteTickerResponse>(postHandler);
export const PUT = withLoggedInUser<FavouriteTickerResponse>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
