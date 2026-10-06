import { prisma } from '@/prisma';
import { CREDIT_HISTORY_PAGE_SIZE, CREDITS_PER_REPORT, CreditHistoryEntryType, CreditTransactionResponse } from '@/types/credits';
import { getUserCredits, UserCredits } from '@/utils/credits/credit-service';
import { getReportHrefs } from '@/utils/credits/report-target';
import { creditDeltaOf, creditsFromStripeBalance, LEDGER_ENTRY_TYPE, listStripeLedger } from '@/utils/credits/stripe-credit-ledger';
import { ReportSpend, ReportSpendStatus } from '@prisma/client';
import Stripe from 'stripe';

/** Upper bound for `?limit=`: each 100 rows is one Stripe list call. */
const MAX_HISTORY_ROWS = 500;

export interface CreditHistoryPage extends UserCredits {
  transactions: CreditTransactionResponse[];
  /** True when older history rows exist beyond `transactions`. */
  hasMore: boolean;
}

/** Reads `?limit=` and clamps it into a range one request can serve. */
export function parseHistoryLimit(rawLimit: string | null): number {
  const requested = Math.floor(Number(rawLimit)) || CREDIT_HISTORY_PAGE_SIZE;
  return Math.min(Math.max(requested, 1), MAX_HISTORY_ROWS);
}

function entryTypeOf(entry: Stripe.CustomerBalanceTransaction): CreditHistoryEntryType {
  switch (entry.metadata?.type) {
    case LEDGER_ENTRY_TYPE.Purchase:
      return 'Purchase';
    case LEDGER_ENTRY_TYPE.ReportSpend:
      return 'ReportSpend';
    default:
      return 'Adjustment';
  }
}

/**
 * The user's balance plus one page of their credit history, shaped for the UI:
 * newest first, with the report link and status each row needs. Shared by the
 * user's own credits page and the admin view of that same user.
 *
 * The history is the Stripe ledger (purchases and charged reports), topped with
 * the runs still in progress — those hold a reserved credit but aren't in
 * Stripe yet. Failed runs were never charged, so they aren't credit history.
 */
export async function loadCreditHistory(userId: string, limit: number): Promise<CreditHistoryPage> {
  const [user, openSpends, balance] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { stripeCustomerId: true, firstPurchaseAt: true } }),
    prisma.reportSpend.findMany({ where: { userId, status: ReportSpendStatus.InProgress }, orderBy: { createdAt: 'desc' } }),
    getUserCredits(userId),
  ]);

  const { entries, hasMore } =
    user.firstPurchaseAt && user.stripeCustomerId ? await listStripeLedger(user.stripeCustomerId, limit) : { entries: [], hasMore: false };

  // Charged reports carry their generation request id in Stripe metadata; the
  // ReportSpend row has the report it points at.
  const chargedRequestIds = entries.map((entry) => entry.metadata?.generationRequestId).filter((id): id is string => !!id);
  const chargedSpends = await prisma.reportSpend.findMany({ where: { userId, generationRequestId: { in: chargedRequestIds } } });
  const spendsByRequestId = new Map(chargedSpends.map((spend) => [spend.generationRequestId, spend]));
  const reportHrefs = await getReportHrefs([...openSpends, ...chargedSpends]);
  const hrefOf = (spend: ReportSpend | undefined): string | null => (spend ? reportHrefs.get(spend.reportTargetId) ?? null : null);

  const inProgressRows: CreditTransactionResponse[] = openSpends.map((spend) => ({
    id: spend.id,
    type: 'ReportSpend',
    credits: -CREDITS_PER_REPORT,
    balanceAfter: null,
    description: `Report generation for ${spend.reportLabel}`,
    amountInCents: null,
    reportLabel: spend.reportLabel,
    reportHref: hrefOf(spend),
    reportStatus: 'InProgress',
    hasReceipt: false,
    createdAt: spend.createdAt.toISOString(),
  }));

  const ledgerRows: CreditTransactionResponse[] = entries.map((entry) => {
    const type = entryTypeOf(entry);
    const credits = creditDeltaOf(entry);
    const spend = spendsByRequestId.get(entry.metadata?.generationRequestId ?? '');
    return {
      id: entry.id,
      type,
      credits,
      balanceAfter: creditsFromStripeBalance(entry.ending_balance),
      description: entry.description ?? (credits >= 0 ? 'Credits added' : 'Credits removed'),
      amountInCents: type === 'Purchase' ? Number(entry.metadata?.amountInCents) || null : null,
      reportLabel: spend?.reportLabel ?? null,
      reportHref: hrefOf(spend),
      reportStatus: type === 'ReportSpend' ? 'Completed' : null,
      hasReceipt: type === 'Purchase' && !!entry.metadata?.paymentIntentId,
      createdAt: new Date(entry.created * 1000).toISOString(),
    };
  });

  return { ...balance, transactions: [...inProgressRows, ...ledgerRows], hasMore };
}
