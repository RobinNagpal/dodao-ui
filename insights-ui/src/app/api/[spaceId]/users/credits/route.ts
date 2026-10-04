import { prisma } from '@/prisma';
import { CREDIT_HISTORY_PAGE_SIZE, CreditBalanceResponse, CreditTransactionResponse, ReportSpendStatus } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getReportHrefs } from '@/utils/credits/report-target';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { CreditTransaction, CreditTransactionType } from '@prisma/client';
import { NextRequest } from 'next/server';

/** Upper bound for `?limit=`, so "Load more" can't ask for the whole table at once. */
const MAX_HISTORY_ROWS = 1000;

// GET /api/[spaceId]/users/credits?limit=50 — the logged-in user's balance and
// their most recent `limit` history rows ("Load more" raises the limit).
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreditBalanceResponse> {
  const { userId } = userContext;
  const requestedLimit = Math.floor(Number(req.nextUrl.searchParams.get('limit'))) || CREDIT_HISTORY_PAGE_SIZE;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_HISTORY_ROWS);

  const [user, transactionsPlusOne, reservedCredits] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } }),
    // One extra row tells us whether there is anything left to load.
    prisma.creditTransaction.findMany({
      where: { userId, spaceId: KoalaGainsSpaceId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    }),
    prisma.creditTransaction.aggregate({
      where: { userId, spaceId: KoalaGainsSpaceId, type: CreditTransactionType.ReportSpend, settledAt: null },
      _sum: { credits: true },
    }),
  ]);
  // At the cap there is nothing more this endpoint can return, so stop offering "Load more".
  const hasMore = transactionsPlusOne.length > limit && limit < MAX_HISTORY_ROWS;
  const transactions = transactionsPlusOne.slice(0, limit);

  // A settled spend was either kept (report generated) or refunded — the refund
  // is its own row sharing the generation request id.
  const spendRequestIds = transactions
    .filter((t) => t.type === CreditTransactionType.ReportSpend && t.generationRequestId)
    .map((t) => t.generationRequestId as string);
  const [refunds, reportHrefs] = await Promise.all([
    prisma.creditTransaction.findMany({
      where: { userId, type: CreditTransactionType.Refund, generationRequestId: { in: spendRequestIds } },
      select: { generationRequestId: true },
    }),
    getReportHrefs(transactions),
  ]);
  const refundedRequestIds = new Set(refunds.map((r) => r.generationRequestId));

  const getReportStatus = (t: CreditTransaction): ReportSpendStatus | null => {
    if (t.type !== CreditTransactionType.ReportSpend) return null;
    if (!t.settledAt) return 'InProgress';
    return refundedRequestIds.has(t.generationRequestId) ? 'Refunded' : 'Completed';
  };

  const getReportHref = (t: CreditTransaction): string | null => (t.reportTargetId ? reportHrefs.get(t.reportTargetId) ?? null : null);

  const history: CreditTransactionResponse[] = transactions.map((transaction) => ({
    id: transaction.id,
    type: transaction.type,
    credits: transaction.credits,
    balanceAfter: transaction.balanceAfter,
    description: transaction.description,
    amountInCents: transaction.amountInCents,
    reportLabel: transaction.reportLabel,
    reportHref: getReportHref(transaction),
    reportStatus: getReportStatus(transaction),
    hasReceipt: transaction.type === CreditTransactionType.Purchase && !!transaction.stripePaymentIntentId,
    createdAt: transaction.createdAt.toISOString(),
  }));

  return {
    credits: user.credits,
    reservedCredits: Math.abs(reservedCredits._sum.credits ?? 0),
    transactions: history,
    hasMore,
  };
}

export const GET = withLoggedInUser<CreditBalanceResponse>(getHandler);
