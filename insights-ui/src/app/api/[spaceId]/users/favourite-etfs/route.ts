import { prisma } from '@/prisma';
import { CreateFavouriteEtfRequest, FavouriteEtfResponse, FavouriteEtfsResponse } from '@/types/etf-user';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ETF_MAX_SCORE, validateScore } from '@/utils/score-validation-utils';

// GET /api/favourite-etfs - Get all favourite ETFs for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FavouriteEtfsResponse> {
  const { userId } = userContext;

  const favouriteEtfs = await prisma.favouriteEtf.findMany({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      etf: {
        include: {
          cachedScore: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { favouriteEtfs: favouriteEtfs as unknown as FavouriteEtfResponse[] };
}

// POST /api/favourite-etfs - Add an ETF to favourites
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FavouriteEtfResponse> {
  const { userId } = userContext;
  const body: CreateFavouriteEtfRequest = await req.json();

  // Never trust the client-supplied score — the UI bounds it, the API must too.
  const myScore = validateScore(body.myScore, ETF_MAX_SCORE);

  // Check if the ETF exists
  const etf = await prisma.etf.findUnique({
    where: {
      id: body.etfId,
    },
  });

  if (!etf) {
    throw new Error('ETF not found');
  }

  // Check if the ETF is already in favourites
  const existingFavourite = await prisma.favouriteEtf.findFirst({
    where: {
      userId: userId,
      etfId: body.etfId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (existingFavourite) {
    throw new Error('ETF is already in favourites');
  }

  // Create the favourite ETF
  const favouriteEtf = await prisma.favouriteEtf.create({
    data: {
      userId: userId,
      etfId: body.etfId,
      spaceId: KoalaGainsSpaceId,
      myNotes: body.myNotes,
      myScore: myScore,
      createdBy: userId,
    },
    include: {
      etf: {
        include: {
          cachedScore: true,
        },
      },
    },
  });

  // NOTE: unlike the ticker routes we intentionally do NOT call
  // revalidatePortfolioProfileIfExists here. ETF favourites are fetched
  // client-side and are not surfaced on any server-cached page yet (e.g. the
  // /favourites listing), so there is no cached consumer to invalidate. Revisit
  // if a server-rendered ETF favourites view is added.
  return favouriteEtf as unknown as FavouriteEtfResponse;
}

export const GET = withLoggedInUser<FavouriteEtfsResponse>(getHandler);
export const POST = withLoggedInUser<FavouriteEtfResponse>(postHandler);
