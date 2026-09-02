import { prisma } from '@/prisma';
import { CreditBalanceResponse, CreditTransactionResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

const HISTORY_PAGE_SIZE = 50;

// GET /api/[spaceId]/users/credits — the logged-in user's balance and recent
// credit history.
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreditBalanceResponse> {
  const { userId } = userContext;

  const [user, transactions] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } }),
    prisma.creditTransaction.findMany({
      where: { userId, spaceId: KoalaGainsSpaceId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_PAGE_SIZE,
    }),
  ]);

  const history: CreditTransactionResponse[] = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    credits: transaction.credits,
    balanceAfter: transaction.balanceAfter,
    description: transaction.description,
    amountInCents: transaction.amountInCents,
    reportLabel: transaction.reportLabel,
    createdAt: transaction.createdAt.toISOString(),
  }));

  return { credits: user.credits, transactions: history };
}

export const GET = withLoggedInUser<CreditBalanceResponse>(getHandler);
