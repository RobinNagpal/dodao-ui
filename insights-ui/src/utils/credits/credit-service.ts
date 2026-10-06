import { prisma } from '@/prisma';
import { CREDITS_PER_REPORT } from '@/types/credits';
import { EtfGenerationRequestStatus } from '@/types/etf/etf-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { sendReportResultEmail } from '@/utils/credits/report-result-email';
import {
  chargeReportInStripe,
  ChargeReportInput,
  fetchStripeCredits,
  getCachedStripeCredits,
  grantPurchaseInStripe,
} from '@/utils/credits/stripe-credit-ledger';
import { CreditReportKind, Prisma, ReportSpendStatus } from '@prisma/client';
import Stripe from 'stripe';

/**
 * Credit accounting.
 *
 * Stripe holds the balance and the ledger (customer balance transactions). The
 * DB holds what Stripe can't answer: which runs are still going. A run reserves
 * its credit as an `InProgress` ReportSpend and is only charged in Stripe once
 * the report has been generated, so a failed run never needs a refund.
 *
 *   spendable credits = Stripe balance − InProgress spends
 */

export interface UserCredits {
  /** What the user can spend right now. */
  credits: number;
  /** Credits held by reports that are still being generated. */
  reservedCredits: number;
  /**
   * True when the balance couldn't be read from Stripe. `credits` is then 0 as
   * a placeholder, not the real balance, so the UI should say so.
   */
  stripeUnavailable: boolean;
}

/**
 * The user's spendable balance for display. A user who never bought costs no
 * Stripe call; everyone else reads a cached balance (see `getCachedStripeCredits`).
 * Never throws for a Stripe outage: pages render with `stripeUnavailable` set.
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  await settleStaleReportSpendsSafely(userId);

  const [user, reservedCredits] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { stripeCustomerId: true, firstPurchaseAt: true } }),
    countReservedCredits(prisma, userId),
  ]);
  if (!user.firstPurchaseAt || !user.stripeCustomerId) {
    return { credits: 0, reservedCredits, stripeUnavailable: false };
  }
  // Every balance change we make adds one of these rows, so their counts version the cache.
  const [purchases, charges] = await Promise.all([
    prisma.stripeCreditPurchase.count({ where: { userId } }),
    prisma.reportSpend.count({ where: { userId, stripeDebitTxnId: { not: null } } }),
  ]);
  try {
    const stripeCredits = await getCachedStripeCredits(user.stripeCustomerId, `${purchases}-${charges}`);
    return { credits: Math.max(0, stripeCredits - reservedCredits), reservedCredits, stripeUnavailable: false };
  } catch (error) {
    console.error('[credit-service] Could not read the Stripe balance; showing 0 credits', userId, error);
    return { credits: 0, reservedCredits, stripeUnavailable: true };
  }
}

async function countReservedCredits(db: Prisma.TransactionClient, userId: string): Promise<number> {
  const openSpends = await db.reportSpend.count({ where: { userId, status: ReportSpendStatus.InProgress } });
  return openSpends * CREDITS_PER_REPORT;
}

export interface GrantPurchasedCreditsInput {
  userId: string;
  stripeCustomerId: string;
  credits: number;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  amountInCents: number;
  currency: string;
}

/**
 * Credits a completed Stripe Checkout Session, exactly once.
 *
 * Stripe's idempotency key dedupes deliveries within 24h; the unique checkout
 * session id on StripeCreditPurchase dedupes the late replays after that. The
 * Stripe call comes first so a crash in between leaves no row, and the retried
 * delivery (same idempotency key) finishes the job without crediting twice.
 */
export async function grantPurchasedCredits(input: GrantPurchasedCreditsInput): Promise<{ granted: boolean }> {
  const { userId, stripeCheckoutSessionId } = input;

  // Every exit below marks the first purchase, not just the one that wrote the
  // row: if that write failed after the row landed, a replay must finish it or
  // the user stays at 0 credits (every balance read is gated on it).
  const alreadyGranted = await prisma.stripeCreditPurchase.findUnique({ where: { stripeCheckoutSessionId }, select: { createdAt: true } });
  if (alreadyGranted) {
    await markFirstPurchase(userId, alreadyGranted.createdAt);
    return { granted: false };
  }

  const creditTxn = await grantPurchaseInStripe(input);

  try {
    const purchase = await prisma.stripeCreditPurchase.create({
      data: {
        userId,
        spaceId: KoalaGainsSpaceId,
        stripeCheckoutSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId,
        stripeCreditTxnId: creditTxn.id,
        credits: input.credits,
        amountInCents: input.amountInCents,
        currency: input.currency,
      },
      select: { createdAt: true },
    });
    await markFirstPurchase(userId, purchase.createdAt);
    return { granted: true };
  } catch (error) {
    // Two concurrent deliveries got the same Stripe transaction back; the other one recorded it.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const recorded = await prisma.stripeCreditPurchase.findUnique({ where: { stripeCheckoutSessionId }, select: { createdAt: true } });
      await markFirstPurchase(userId, recorded?.createdAt ?? new Date());
      return { granted: false };
    }
    throw error;
  }
}

/** Idempotent: only the first purchase sets it, and repeating it is harmless. */
async function markFirstPurchase(userId: string, purchasedAt: Date): Promise<void> {
  await prisma.user.updateMany({ where: { id: userId, firstPurchaseAt: null }, data: { firstPurchaseAt: purchasedAt } });
}

export interface SpendCreditInput {
  userId: string;
  reportKind: CreditReportKind;
  reportTargetId: string;
  symbol: string;
  exchange: string;
  /** Human-readable "AAPL (NASDAQ)" used in the credit history. */
  reportLabel: string;
}

export type SpendCreditResult<T> = { outcome: 'Started'; generationRequest: T } | { outcome: 'InsufficientCredits' } | { outcome: 'AlreadyInProgress' };

export interface SpendCreditTarget<T> {
  createGenerationRequest: (tx: Prisma.TransactionClient) => Promise<T>;
}

/**
 * Reserves one credit and creates the generation request it pays for, atomically.
 * Nothing is taken from Stripe here — that happens in `settleReportCredit`.
 *
 * The user row is locked for the whole check, so two simultaneous clicks run one
 * after the other: the second sees the first one's reservation and can't spend
 * the same last credit. The balance is read live from Stripe inside the lock.
 * Runs started by an admin or the nightly job don't block a paid run; only the
 * user's own unfinished paid run on the same report does.
 */
export async function spendCreditForReport<T extends { id: string }>(input: SpendCreditInput, target: SpendCreditTarget<T>): Promise<SpendCreditResult<T>> {
  const { userId, reportTargetId } = input;

  // Release (or charge) runs whose settle never landed before counting what's reserved.
  await settleStaleReportSpendsSafely(userId);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { stripeCustomerId: true, firstPurchaseAt: true } });
  const stripeCustomerId = user.stripeCustomerId;
  if (!user.firstPurchaseAt || !stripeCustomerId) {
    return { outcome: 'InsufficientCredits' };
  }

  return prisma.$transaction(
    async (tx): Promise<SpendCreditResult<T>> => {
      // NO KEY UPDATE, not UPDATE: it still serializes this user's spends, but
      // doesn't block the KEY SHARE locks that inserts referencing users (sessions,
      // etc.) take, which would otherwise wait on the Stripe read below.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR NO KEY UPDATE`;

      const openSpendOnTarget = await tx.reportSpend.findFirst({
        where: { userId, reportTargetId, status: ReportSpendStatus.InProgress },
        select: { id: true },
      });
      if (openSpendOnTarget) {
        return { outcome: 'AlreadyInProgress' };
      }

      // Order matters: reserved count FIRST, Stripe balance SECOND, one after the
      // other. A concurrent settle charges in Stripe and only then closes its row,
      // so a run is always either still counted as reserved or already taken from
      // the balance — and with this order, possibly both (we under-count by one,
      // which is safe), never neither. Reading them concurrently, or balance
      // first, could see the pre-charge balance AND the closed row, overstating
      // spendable credits by one.
      const reservedCredits = await countReservedCredits(tx, userId);
      const stripeCredits = await fetchLiveStripeCreditsForSpend(stripeCustomerId);
      if (stripeCredits - reservedCredits < CREDITS_PER_REPORT) {
        return { outcome: 'InsufficientCredits' };
      }

      const generationRequest = await target.createGenerationRequest(tx);
      await tx.reportSpend.create({
        data: {
          userId,
          spaceId: KoalaGainsSpaceId,
          reportKind: input.reportKind,
          reportTargetId,
          symbol: input.symbol,
          exchange: input.exchange,
          reportLabel: input.reportLabel,
          generationRequestId: generationRequest.id,
        },
      });

      return { outcome: 'Started', generationRequest };
    },
    // The live Stripe read (≤ ~10s even when Stripe is struggling, see
    // fetchStripeCredits) happens inside the transaction, so allow for it.
    { timeout: 20_000 }
  );
}

/** Spending fails closed: if Stripe can't confirm the balance, nothing starts. */
async function fetchLiveStripeCreditsForSpend(stripeCustomerId: string): Promise<number> {
  try {
    return await fetchStripeCredits(stripeCustomerId);
  } catch (error) {
    console.error('[credit-service] Could not read the Stripe balance; refusing to start a paid run', stripeCustomerId, error);
    throw new Error("We couldn't check your credit balance right now. Please try again in a few minutes.");
  }
}

/**
 * Closes out the credit reserved for a finished generation request.
 *
 * Success charges one credit in Stripe; failure (including a partial run, since
 * the user paid for a full report) charges nothing. The charge is retried once
 * with the same idempotency key (see `chargeReportWithRetry`); if both attempts
 * fail the run is still closed as Completed — the user keeps the report for
 * free rather than being stuck with a reserved credit. If this function never
 * gets to run (crash, timeout), `settleStaleReportSpends` picks the run up. Either way the user who
 * paid is emailed the result (best effort). A no-op for admin- and cron-created
 * requests, which have no ReportSpend.
 */
export async function settleReportCredit(generationRequestId: string, succeeded: boolean): Promise<void> {
  const spend = await prisma.reportSpend.findUnique({
    where: { generationRequestId },
    include: { user: { select: { stripeCustomerId: true } } },
  });
  if (!spend || spend.status !== ReportSpendStatus.InProgress) {
    return;
  }

  let stripeDebitTxnId: string | null = null;
  if (succeeded && spend.user.stripeCustomerId) {
    // Charged before the row is closed: until it is, the credit still counts
    // as reserved, so the spendable balance can never briefly overstate.
    const debit = await chargeReportWithRetry({ ...spend, stripeCustomerId: spend.user.stripeCustomerId });
    stripeDebitTxnId = debit?.id ?? null;
  }

  // The status filter makes concurrent settles close the row once, so only one emails.
  const settled = await prisma.reportSpend.updateMany({
    where: { id: spend.id, status: ReportSpendStatus.InProgress },
    data: { status: succeeded ? ReportSpendStatus.Completed : ReportSpendStatus.Failed, stripeDebitTxnId, settledAt: new Date() },
  });
  if (settled.count === 0) {
    return;
  }

  await sendReportResultEmail(spend, succeeded);
}

/** Pause before re-sending a charge, so a still-in-flight first attempt can finish. */
const CHARGE_RETRY_DELAY_MS = 1_000;

/**
 * Charges the report, retrying once on error. An error doesn't mean the charge
 * didn't land (a timeout or reset connection can hide a success); the retry
 * reuses the same idempotency key, so Stripe hands back the original
 * transaction instead of charging again. Returns null only when both attempts
 * fail — the report is then kept free of charge.
 */
export async function chargeReportWithRetry(input: ChargeReportInput, retryDelayMs = CHARGE_RETRY_DELAY_MS): Promise<Stripe.CustomerBalanceTransaction | null> {
  try {
    return await chargeReportInStripe(input);
  } catch (firstError) {
    console.warn('[credit-service] Stripe charge errored; retrying with the same idempotency key', input.generationRequestId, firstError);
  }
  await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  try {
    return await chargeReportInStripe(input);
  } catch (error) {
    console.error('[credit-service] Stripe charge failed twice; report kept free of charge', input.generationRequestId, error);
    return null;
  }
}

/** At most this many stale runs are settled per call, oldest first. */
const STALE_SETTLE_BATCH = 5;
/**
 * A finished request is only treated as stale this long after it ended, so the
 * reconciliation doesn't race the normal settle that follows markAsCompleted.
 */
const STALE_SETTLE_GRACE_MS = 2 * 60 * 1000;

/**
 * Settles this user's paid runs whose generation request has already finished
 * but whose ReportSpend is still InProgress — e.g. the settle after
 * markAsCompleted crashed or timed out on Stripe, and nothing retries it.
 * Completed requests are charged, Failed ones released. A request that no
 * longer exists (deleted with its ticker / ETF) can never finish, so its run is
 * released uncharged. Bounded and idempotent, so it's cheap to call on reads.
 * Returns how many runs were settled.
 */
export async function settleStaleReportSpends(userId: string): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_SETTLE_GRACE_MS);
  const openSpends = await prisma.reportSpend.findMany({
    where: { userId, status: ReportSpendStatus.InProgress, createdAt: { lt: cutoff } },
    orderBy: { createdAt: 'asc' },
    take: STALE_SETTLE_BATCH,
    select: { generationRequestId: true, reportKind: true },
  });
  if (openSpends.length === 0) {
    return 0;
  }

  const outcomes = await finishedRequestOutcomes(openSpends, cutoff);
  for (const [generationRequestId, succeeded] of outcomes) {
    console.log('[credit-service] Settling stale paid run', generationRequestId, succeeded ? 'Completed' : 'Failed');
    await settleReportCredit(generationRequestId, succeeded);
  }
  return outcomes.size;
}

interface RequestEnd {
  id: string;
  status: string;
  completedAt: Date | null;
  updatedAt: Date;
}

/**
 * generationRequestId → succeeded, for the requests that ended before `cutoff`
 * (or no longer exist). Still-running requests are left out. Stock and ETF
 * requests live in different tables but share the same status strings, and
 * `Completed` vs `Failed` is exactly what markAsCompleted / markEtfRequestAsCompleted
 * pass to settleReportCredit.
 */
async function finishedRequestOutcomes(spends: { generationRequestId: string; reportKind: CreditReportKind }[], cutoff: Date): Promise<Map<string, boolean>> {
  const idsOf = (kind: CreditReportKind): string[] => spends.filter((spend) => spend.reportKind === kind).map((spend) => spend.generationRequestId);
  const stockIds = idsOf(CreditReportKind.Stock);
  const etfIds = idsOf(CreditReportKind.Etf);
  const select = { id: true, status: true, completedAt: true, updatedAt: true } as const;

  const [stockRequests, etfRequests]: [RequestEnd[], RequestEnd[]] = await Promise.all([
    stockIds.length ? prisma.tickerV1GenerationRequest.findMany({ where: { id: { in: stockIds } }, select }) : Promise.resolve([]),
    etfIds.length ? prisma.etfGenerationRequest.findMany({ where: { id: { in: etfIds } }, select }) : Promise.resolve([]),
  ]);
  const requestsById = new Map([...stockRequests, ...etfRequests].map((request) => [request.id, request]));

  const outcomes = new Map<string, boolean>();
  for (const { generationRequestId } of spends) {
    const request = requestsById.get(generationRequestId);
    if (!request) {
      outcomes.set(generationRequestId, false);
      continue;
    }
    const endedAt = request.completedAt ?? request.updatedAt;
    if (endedAt >= cutoff) {
      continue;
    }
    if (request.status === GenerationRequestStatus.Completed || request.status === EtfGenerationRequestStatus.Completed) {
      outcomes.set(generationRequestId, true);
    } else if (request.status === GenerationRequestStatus.Failed || request.status === EtfGenerationRequestStatus.Failed) {
      outcomes.set(generationRequestId, false);
    }
  }
  return outcomes;
}

/** Reconciliation is best effort on read paths: it must never break the page or the spend. */
async function settleStaleReportSpendsSafely(userId: string): Promise<void> {
  try {
    await settleStaleReportSpends(userId);
  } catch (error) {
    console.error('[credit-service] Settling stale paid runs failed', userId, error);
  }
}
