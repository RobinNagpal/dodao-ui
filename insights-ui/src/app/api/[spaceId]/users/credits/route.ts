import { prisma } from '@/prisma';
import { CreditBalanceResponse, CreditTransactionResponse, ReportSpendStatus } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { CreditTransaction, CreditTransactionType } from '@prisma/client';
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

  // A settled spend was either kept (report generated) or refunded — the refund
  // is its own row sharing the generation request id.
  const spendRequestIds = transactions
    .filter((t) => t.type === CreditTransactionType.ReportSpend && t.generationRequestId)
    .map((t) => t.generationRequestId as string);
  const [refunds, reservedCredits] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId, type: CreditTransactionType.Refund, generationRequestId: { in: spendRequestIds } },
      select: { generationRequestId: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { userId, spaceId: KoalaGainsSpaceId, type: CreditTransactionType.ReportSpend, settledAt: null },
      _sum: { credits: true },
    }),
  ]);
  const refundedRequestIds = new Set(refunds.map((r) => r.generationRequestId));

  const getReportStatus = (t: CreditTransaction): ReportSpendStatus | null => {
    if (t.type !== CreditTransactionType.ReportSpend) return null;
    if (!t.settledAt) return 'InProgress';
    return refundedRequestIds.has(t.generationRequestId) ? 'Refunded' : 'Completed';
  };

  const history: CreditTransactionResponse[] = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    credits: transaction.credits,
    balanceAfter: transaction.balanceAfter,
    description: transaction.description,
    amountInCents: transaction.amountInCents,
    reportLabel: transaction.reportLabel,
    reportStatus: getReportStatus(transaction),
    createdAt: transaction.createdAt.toISOString(),
  }));

  return { credits: user.credits, reservedCredits: Math.abs(reservedCredits._sum.credits ?? 0), transactions: history };
}

export const GET = withLoggedInUser<CreditBalanceResponse>(getHandler);
