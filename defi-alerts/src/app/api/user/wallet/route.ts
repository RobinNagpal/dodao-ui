import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';

interface AddWalletRequest {
  walletAddress: string;
}

interface DeleteWalletRequest {
  walletAddress: string;
}

async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const body = (await request.json()) as AddWalletRequest;

  if (!body.walletAddress) {
    throw new Error('Wallet address is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletAddress: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const existing = (user.walletAddress || []).map((w) => w.toLowerCase());
  if (existing.includes(body.walletAddress.toLowerCase())) {
    throw new Error('Wallet Already Added');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      walletAddress: {
        push: body.walletAddress,
      },
    },
  });

  return { success: true };
}

async function deleteHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const body = (await request.json()) as DeleteWalletRequest;

  if (!body.walletAddress) {
    throw new Error('Wallet address is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletAddress: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const currentWallets = user.walletAddress || [];
  const walletToDelete = body.walletAddress.toLowerCase();

  if (!currentWallets.some((w) => w.toLowerCase() === walletToDelete)) {
    throw new Error('Wallet address not found');
  }

  const updatedWallets = currentWallets.filter((w) => w.toLowerCase() !== walletToDelete);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        walletAddress: updatedWallets,
      },
    }),
    prisma.alert.updateMany({
      where: {
        userId: userId,
        walletAddress: body.walletAddress,
      },
      data: {
        archive: true,
      },
    }),
  ]);

  return { success: true };
}

export const POST = withLoggedInUser<{ success: boolean }>(postHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
