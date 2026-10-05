import { prisma } from '@/prisma';
import { CREDIT_HISTORY_PAGE_SIZE, CreditTransactionResponse, ReportSpendStatus } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getReportHrefs } from '@/utils/credits/report-target';
import { CreditTransaction, CreditTransactionType } from '@prisma/client';

/** Upper bound for `?limit=`, so "Load more" can't ask for the whole table at once. */
const MAX_HISTORY_ROWS = 1000;

export interface CreditHistoryPage {
  transactions: CreditTransactionResponse[];
  /** True when older history rows exist beyond `transactions`. */
  hasMore: boolean;
  /** Credits held by reports that are still being generated. */
  reservedCredits: number;
}

/** Reads `?limit=` and clamps it into a range one query can serve. */
export function parseHistoryLimit(rawLimit: string | null): number {
  const requested = Number(rawLimit) || CREDIT_HISTORY_PAGE_SIZE;
  return Math.min(Math.max(requested, 1), MAX_HISTORY_ROWS);
}

/**
 * One page of a user's credit ledger, shaped for the UI: newest first, with the
 * report link and spend status each row needs. Shared by the user's own credits
 * page and the admin view of that same user, so both render identical history.
 */
export async function loadCreditHistory(userId: string, limit: number): Promise<CreditHistoryPage> {
  const [transactionsPlusOne, reservedCredits] = await Promise.all([
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
  const hasMore = transactionsPlusOne.length > limit;
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

  return {
    transactions: transactions.map((transaction) => ({
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
    })),
    hasMore,
    reservedCredits: Math.abs(reservedCredits._sum.credits ?? 0),
  };
}
