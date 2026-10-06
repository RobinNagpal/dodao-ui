import { CREDIT_CURRENCY, CREDITS_PER_REPORT } from '@/types/credits';
import { EXCHANGE_TO_COUNTRY, isExchange } from '@/utils/countryExchangeUtils';
import { getStripeClient } from '@/utils/credits/stripe-client';
import { CreditReportKind } from '@prisma/client';
import { revalidateTag, unstable_cache } from 'next/cache';
import Stripe from 'stripe';

/**
 * The credit ledger, kept in Stripe as customer balance transactions.
 *
 * Stripe stores a customer balance in cents, and a NEGATIVE balance is credit
 * owed to the customer. One credit is stored as 100 cents, so the Stripe
 * dashboard reads "$10.00 credit" for 10 credits. This is a storage unit, not
 * the price: never change it, or every existing balance changes meaning.
 *
 * Stripe automatically applies a customer balance to the next invoice it
 * finalizes. We only sell through Checkout in `payment` mode without invoice
 * creation, which never touches the balance — keep it that way (no
 * subscriptions, no `invoice_creation`) for these customers.
 */
const STRIPE_CENTS_PER_CREDIT = 100;

/** `metadata.type` on every balance transaction we write. */
export const LEDGER_ENTRY_TYPE = {
  Purchase: 'purchase',
  ReportSpend: 'report_spend',
  /** Credits taken back because (part of) a purchase's card payment was refunded. */
  Refund: 'refund',
  /** Credits taken back because a purchase's card payment was disputed (chargeback or inquiry). */
  Dispute: 'dispute',
  /**
   * Credits given back when a dispute closes with the merchant keeping the money
   * (won, inquiry closed, prevented). The value predates the non-`won` outcomes;
   * keep it, existing entries and the dedupe search use it.
   */
  DisputeRestore: 'dispute_won',
} as const;

/** A Stripe balance (or `ending_balance`) as whole spendable credits. */
export function creditsFromStripeBalance(balance: number): number {
  return Math.max(0, Math.floor(-balance / STRIPE_CENTS_PER_CREDIT));
}

/**
 * Balance reads are on a page's critical path (and inside the spend
 * transaction), so they get a tighter budget than the client default: when
 * Stripe is down the caller should find out in seconds, not a minute.
 */
const BALANCE_READ_OPTIONS: Stripe.RequestOptions = { timeout: 5_000, maxNetworkRetries: 1 };

/** Live balance straight from Stripe. Used where it must be exact: deciding whether a run can start. */
export async function fetchStripeCredits(stripeCustomerId: string): Promise<number> {
  const customer = await (await getStripeClient()).customers.retrieve(stripeCustomerId, {}, BALANCE_READ_OPTIONS);
  return customer.deleted ? 0 : creditsFromStripeBalance(customer.balance);
}

function stripeCreditBalanceTag(stripeCustomerId: string): string {
  return `stripe-credit-balance-${stripeCustomerId}`;
}

/**
 * Cached balance for display (navbar, credits page). A purchase and a charged
 * report both add a DB row, so the caller passes `ledgerVersion` (e.g.
 * "purchases-charges" counts): a new purchase or charge changes the cache key
 * and the next read goes to Stripe. That needs no cache invalidation, so it also
 * holds when a run is settled outside a request (cron, scripts). Refund /
 * dispute debits and dispute restores add no DB row, so the webhook busts the
 * cache with `invalidateCachedStripeCredits`. The revalidate window only catches
 * edits made by hand in the Stripe dashboard.
 */
export function getCachedStripeCredits(stripeCustomerId: string, ledgerVersion: string): Promise<number> {
  return unstable_cache(() => fetchStripeCredits(stripeCustomerId), ['stripe-credit-balance', stripeCustomerId, ledgerVersion], {
    revalidate: 300,
    tags: [stripeCreditBalanceTag(stripeCustomerId)],
  })();
}

/**
 * Drops the cached display balance after a ledger write that adds no DB row.
 * Never throws: outside a Next request (a script) there is no cache to bust, and
 * a stale display balance is not worth failing the (already written) ledger entry.
 */
export function invalidateCachedStripeCredits(stripeCustomerId: string): void {
  try {
    revalidateTag(stripeCreditBalanceTag(stripeCustomerId));
  } catch (error) {
    console.warn(`[stripe-credit-ledger] Could not invalidate the cached balance of ${stripeCustomerId}`, error);
  }
}

export interface GrantPurchaseInput {
  stripeCustomerId: string;
  userId: string;
  credits: number;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  amountInCents: number;
}

/** How far back the ledger dedupe searches look: one list call, newest first. */
const LEDGER_LOOKBACK = 100;

/**
 * The customer's newest `LEDGER_LOOKBACK` balance transactions. Stripe can't
 * query by metadata, so the dedupe searches below scan this page. Webhooks are
 * only retried for 3 days, and no customer adds 100 ledger entries in that time.
 */
export async function listRecentLedgerEntries(stripeCustomerId: string): Promise<Stripe.CustomerBalanceTransaction[]> {
  const recent = await (await getStripeClient()).customers.listBalanceTransactions(stripeCustomerId, { limit: LEDGER_LOOKBACK });
  return recent.data;
}

/** The purchase transaction already written for this checkout session, if it is among the customer's newest entries. */
export async function findPurchaseInStripe(stripeCustomerId: string, stripeCheckoutSessionId: string): Promise<Stripe.CustomerBalanceTransaction | null> {
  const recent = await listRecentLedgerEntries(stripeCustomerId);
  return (
    recent.find(
      (transaction) => transaction.metadata?.type === LEDGER_ENTRY_TYPE.Purchase && transaction.metadata?.checkoutSessionId === stripeCheckoutSessionId
    ) ?? null
  );
}

/**
 * Adds purchased credits to the customer balance, at most once per checkout
 * session. Two layers keep a retried webhook from crediting twice:
 * - the idempotency key returns the same transaction for concurrent or retried
 *   deliveries, but Stripe only keeps it for 24h;
 * - webhooks are retried for 3 days, so past that window (e.g. the DB insert
 *   after this call kept failing) the existing transaction is found by its
 *   `checkoutSessionId` metadata and reused instead of creating a second one.
 */
export async function grantPurchaseInStripe(input: GrantPurchaseInput): Promise<Stripe.CustomerBalanceTransaction> {
  const existing = await findPurchaseInStripe(input.stripeCustomerId, input.stripeCheckoutSessionId);
  if (existing) {
    return existing;
  }

  return (await getStripeClient()).customers.createBalanceTransaction(
    input.stripeCustomerId,
    {
      amount: -input.credits * STRIPE_CENTS_PER_CREDIT,
      currency: CREDIT_CURRENCY,
      description: `Purchased ${input.credits} ${input.credits === 1 ? 'credit' : 'credits'}`,
      metadata: {
        type: LEDGER_ENTRY_TYPE.Purchase,
        userId: input.userId,
        credits: String(input.credits),
        checkoutSessionId: input.stripeCheckoutSessionId,
        paymentIntentId: input.stripePaymentIntentId ?? '',
        amountInCents: String(input.amountInCents),
      },
    },
    { idempotencyKey: `credit-purchase-${input.stripeCheckoutSessionId}` }
  );
}

export interface ReversalDebitInput {
  stripeCustomerId: string;
  userId: string;
  /** Credits to take back; must be > 0. */
  credits: number;
  type: typeof LEDGER_ENTRY_TYPE.Refund | typeof LEDGER_ENTRY_TYPE.Dispute;
  /** The Stripe refund id (`re_…`) or dispute id (`du_…`) this debit is for. */
  sourceId: string;
  paymentIntentId: string;
  checkoutSessionId: string;
}

/** The entry of this `metadata.type` written for this refund / dispute (`sourceId`), if it is in `ledger`. */
export function findLedgerEntryForSource(
  ledger: Stripe.CustomerBalanceTransaction[],
  type: string,
  sourceId: string
): Stripe.CustomerBalanceTransaction | undefined {
  return ledger.find((entry) => entry.metadata?.type === type && entry.metadata?.sourceId === sourceId);
}

/** Idempotency key / dedupe id of the debit for one refund or dispute. */
export function reversalIdempotencyKey(type: ReversalDebitInput['type'], sourceId: string): string {
  return `credit-${type}-${sourceId}`;
}

/**
 * Takes back credits for a refunded or disputed purchase, at most once per
 * refund / dispute: the idempotency key covers concurrent and retried deliveries
 * within 24h, and `existing` (found by the caller in the recent ledger by
 * `sourceId`) covers a replay after that. The debit can push the balance above
 * zero (credits already spent are now owed); the display clamps it to 0.
 */
export async function postReversalDebitInStripe(input: ReversalDebitInput): Promise<Stripe.CustomerBalanceTransaction> {
  const what = input.type === LEDGER_ENTRY_TYPE.Refund ? 'refund' : 'dispute';
  return (await getStripeClient()).customers.createBalanceTransaction(
    input.stripeCustomerId,
    {
      amount: input.credits * STRIPE_CENTS_PER_CREDIT,
      currency: CREDIT_CURRENCY,
      description: `Removed ${input.credits} ${input.credits === 1 ? 'credit' : 'credits'} (payment ${what})`,
      metadata: {
        type: input.type,
        userId: input.userId,
        credits: String(input.credits),
        sourceId: input.sourceId,
        paymentIntentId: input.paymentIntentId,
        checkoutSessionId: input.checkoutSessionId,
      },
    },
    { idempotencyKey: reversalIdempotencyKey(input.type, input.sourceId) }
  );
}

export interface DisputeRestoreInput {
  stripeCustomerId: string;
  userId: string;
  /** The dispute (`du_…`) whose debit is given back. */
  sourceId: string;
  /** The `dispute` debit this gives back; the restore is exactly its amount. */
  debit: Stripe.CustomerBalanceTransaction;
  /** The dispute's closing status (`won`, `warning_closed`, `prevented`), for the description. */
  outcome: string;
  paymentIntentId: string;
  checkoutSessionId: string;
}

/** Credits in a `refund` / `dispute` / `dispute_won` entry, as written in its metadata. */
export function creditsOfLedgerEntry(entry: Stripe.CustomerBalanceTransaction): number {
  return Number(entry.metadata?.credits) || 0;
}

/**
 * Gives back a dispute's debit once the dispute closed with the money kept, at
 * most once per dispute: the idempotency key `credit-dispute-won-<du_…>` covers
 * concurrent and retried deliveries within 24h, and the caller's recent-ledger
 * check for a `dispute_won` entry with this `sourceId` covers a replay after that.
 */
export async function postDisputeRestoreInStripe(input: DisputeRestoreInput): Promise<Stripe.CustomerBalanceTransaction> {
  const credits = creditsOfLedgerEntry(input.debit);
  return (await getStripeClient()).customers.createBalanceTransaction(
    input.stripeCustomerId,
    {
      // Exactly the debit's amount, negated: a negative balance change is credit.
      amount: -input.debit.amount,
      currency: input.debit.currency,
      description: `Restored ${credits} ${credits === 1 ? 'credit' : 'credits'} (payment dispute closed: ${input.outcome.replace(/_/g, ' ')})`,
      metadata: {
        type: LEDGER_ENTRY_TYPE.DisputeRestore,
        userId: input.userId,
        credits: String(credits),
        sourceId: input.sourceId,
        debitTxnId: input.debit.id,
        paymentIntentId: input.paymentIntentId,
        checkoutSessionId: input.checkoutSessionId,
      },
    },
    // Unchanged from when only won disputes were restored, so the key still matches older attempts.
    { idempotencyKey: `credit-dispute-won-${input.sourceId}` }
  );
}

export interface ChargeReportInput {
  stripeCustomerId: string;
  userId: string;
  reportKind: CreditReportKind;
  symbol: string;
  exchange: string;
  reportLabel: string;
  generationRequestId: string;
}

/**
 * Takes one credit for a generated report. Keyed on the generation request, so
 * two settles of the same run can never charge twice, and a retry after an
 * error that hid a landed charge gets the original transaction back.
 */
export async function chargeReportInStripe(input: ChargeReportInput): Promise<Stripe.CustomerBalanceTransaction> {
  return (await getStripeClient()).customers.createBalanceTransaction(
    input.stripeCustomerId,
    {
      amount: CREDITS_PER_REPORT * STRIPE_CENTS_PER_CREDIT,
      currency: CREDIT_CURRENCY,
      description: `Report generation for ${input.reportLabel}`,
      metadata: {
        type: LEDGER_ENTRY_TYPE.ReportSpend,
        userId: input.userId,
        reportKind: input.reportKind,
        symbol: input.symbol,
        exchange: input.exchange,
        country: isExchange(input.exchange) ? EXCHANGE_TO_COUNTRY[input.exchange] : '',
        generationRequestId: input.generationRequestId,
      },
    },
    { idempotencyKey: `report-spend-${input.generationRequestId}` }
  );
}

/** The newest `limit` ledger entries, newest first, plus whether older ones exist. */
export async function listStripeLedger(stripeCustomerId: string, limit: number): Promise<{ entries: Stripe.CustomerBalanceTransaction[]; hasMore: boolean }> {
  // One extra entry tells us whether there is anything left to load.
  const entries = await (await getStripeClient()).customers
    .listBalanceTransactions(stripeCustomerId, { limit: Math.min(limit + 1, 100) })
    .autoPagingToArray({ limit: limit + 1 });
  return { entries: entries.slice(0, limit), hasMore: entries.length > limit };
}

/**
 * The report charge already written for this generation request, if it is among
 * the customer's newest entries. Read-only. Lets a settle that runs after the 24h
 * idempotency window (e.g. it crashed between charging and closing the row, and
 * reconciliation only picked it up a day later) reuse the charge instead of
 * taking a second credit.
 */
export async function findReportChargeInStripe(stripeCustomerId: string, generationRequestId: string): Promise<Stripe.CustomerBalanceTransaction | null> {
  const recent = await listRecentLedgerEntries(stripeCustomerId);
  return (
    recent.find(
      (transaction) => transaction.metadata?.type === LEDGER_ENTRY_TYPE.ReportSpend && transaction.metadata?.generationRequestId === generationRequestId
    ) ?? null
  );
}
