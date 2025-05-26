import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';

interface WalletResponse {
  walletAddresses: string[];
}

async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<WalletResponse> {
  const { userId } = userContext;

  // Get user's wallet addresses from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const userWithWallets = user as any;

  return { walletAddresses: userWithWallets.walletAddress || [] };
}

export const GET = withLoggedInUser<WalletResponse>(getHandler);
