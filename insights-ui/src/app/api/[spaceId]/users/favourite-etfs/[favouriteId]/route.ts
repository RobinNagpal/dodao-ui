import { NextRequest } from 'next/server';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { FavouriteEtfResponse, UpdateFavouriteEtfRequest } from '@/types/etf-user';
import { verifyUserRecordOwnership } from '@/utils/user-record-verification-utils';

// PUT /api/favourite-etfs/[favouriteId] - Update a single favourite ETF
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ favouriteId: string }> }
): Promise<FavouriteEtfResponse> {
  const { userId } = userContext;
  const { favouriteId } = await params;

  // Verify the favourite belongs to the user
  await verifyUserRecordOwnership(prisma.favouriteEtf, favouriteId, userId, 'Favourite not found or you do not have permission to update it');

  const updateBody: UpdateFavouriteEtfRequest = await req.json();

  // Update the favourite ETF
  const updatedFavourite = await prisma.favouriteEtf.update({
    where: {
      id: favouriteId,
    },
    data: {
      myNotes: updateBody.myNotes !== undefined ? updateBody.myNotes : undefined,
      myScore: updateBody.myScore !== undefined ? updateBody.myScore : undefined,
    },
    include: {
      etf: {
        include: {
          cachedScore: true,
        },
      },
    },
  });

  return updatedFavourite as unknown as FavouriteEtfResponse;
}

// DELETE /api/favourite-etfs/[favouriteId] - Remove a favourite ETF
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ favouriteId: string }> }
): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { favouriteId } = await params;

  // Verify the favourite belongs to the user
  await verifyUserRecordOwnership(prisma.favouriteEtf, favouriteId, userId, 'Favourite not found or you do not have permission to delete it');

  await prisma.favouriteEtf.delete({
    where: {
      id: favouriteId,
    },
  });

  return { success: true };
}

export const PUT = withLoggedInUser<FavouriteEtfResponse>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
