import { prisma } from '@/prisma';
import { CREDITS_PER_REPORT } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GenerationRequestStatus } from '@/types/ticker-typesv1';
import { sendReportResultEmail } from '@/utils/credits/report-result-email';
import {
  chargeReportInStripe,
  ChargeReportInput,
  fetchStripeCredits,
  findReportChargeInStripe,
  getCachedStripeCredits,
  grantPurchaseInStripe,
} from '@/utils/credits/stripe-credit-ledger';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { CreditReportKind, Prisma, ReportSpend, ReportSpendStatus } from '@prisma/client';
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
  // Reconciliation runs from the generation heartbeat for every user. This is
  // only a fire-and-forget nudge for the viewing user: a page never waits on a
  // Stripe settle.
  void settleStaleReportSpendsSafely(userId);

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

export type SpendCreditResult<T> =
  | { outcome: 'Started'; generationRequest: T }
  | { outcome: 'InsufficientCredits' }
  | { outcome: 'AlreadyInProgress' }
  | { outcome: 'TooManyInProgress'; message: string }
  | { outcome: 'TemporarilyUnavailable'; message: string };

/** A user can have at most this many paid runs going at once. */
export const MAX_IN_PROGRESS_PAID_RUNS = 3;
export const TOO_MANY_IN_PROGRESS_MESSAGE = `You already have ${MAX_IN_PROGRESS_PAID_RUNS} reports being generated. Please wait for one to finish before starting another.`;
/** A report whose last this-many generation requests all failed recently is not sold until one succeeds. */
const RECENT_FAILURE_RUN_LENGTH = 3;
const RECENT_FAILURE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const REPORT_TEMPORARILY_UNAVAILABLE_MESSAGE = 'This report is failing to generate right now. Please try again later';

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

      // Failed runs are free, so cap what a user can have going at once and
      // don't sell a report that keeps failing (from any source).
      const openSpends = await tx.reportSpend.count({ where: { userId, status: ReportSpendStatus.InProgress } });
      if (openSpends >= MAX_IN_PROGRESS_PAID_RUNS) {
        return { outcome: 'TooManyInProgress', message: TOO_MANY_IN_PROGRESS_MESSAGE };
      }
      if (await isTargetFailingRepeatedly(tx, input.reportKind, reportTargetId)) {
        return { outcome: 'TemporarilyUnavailable', message: REPORT_TEMPORARILY_UNAVAILABLE_MESSAGE };
      }

      // Order matters: reserved count FIRST, Stripe balance SECOND, one after the
      // other. A concurrent settle charges in Stripe and only then closes its row,
      // so a run is always either still counted as reserved or already taken from
      // the balance — and with this order, possibly both (we under-count by one,
      // which is safe), never neither. Reading them concurrently, or balance
      // first, could see the pre-charge balance AND the closed row, overstating
      // spendable credits by one.
      const reservedCredits = openSpends * CREDITS_PER_REPORT;
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

/**
 * True when the target's last `RECENT_FAILURE_RUN_LENGTH` generation requests
 * (any source: paid, admin, nightly) all ended Failed within the last 7 days.
 * One indexed query (`[tickerId]` / `[etfId]`).
 */
async function isTargetFailingRepeatedly(db: Prisma.TransactionClient, reportKind: CreditReportKind, reportTargetId: string): Promise<boolean> {
  const query = { orderBy: { createdAt: 'desc' }, take: RECENT_FAILURE_RUN_LENGTH, select: { status: true, completedAt: true, updatedAt: true } } as const;
  const recent =
    reportKind === CreditReportKind.Stock
      ? await db.tickerV1GenerationRequest.findMany({ where: { tickerId: reportTargetId }, ...query })
      : await db.etfGenerationRequest.findMany({ where: { etfId: reportTargetId }, ...query });
  if (recent.length < RECENT_FAILURE_RUN_LENGTH) {
    return false;
  }
  const since = Date.now() - RECENT_FAILURE_WINDOW_MS;
  return recent.every((request) => request.status === GenerationRequestStatus.Failed && (request.completedAt ?? request.updatedAt).getTime() >= since);
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
 * The outcome is read from the request's STORED status, never taken from the
 * caller: this only settles once the request is terminal (`Completed` →
 * charged, `Failed` → released uncharged, including a partial run, since the
 * user paid for a full report). A request that is still running is left alone,
 * so a bug that calls this mid-run can't close a paid run early. A request that
 * no longer exists (deleted with its ticker / ETF) can never finish and is
 * released. If this never gets to run (crash, timeout), `settleStaleReportSpends`
 * picks the run up. A no-op for admin- and cron-created requests, which have no
 * ReportSpend.
 */
export async function settleReportCredit(generationRequestId: string): Promise<void> {
  const spend = await findOpenSpend(generationRequestId);
  if (!spend) {
    return;
  }

  const status = await storedRequestStatus(spend.reportKind, generationRequestId);
  if (status !== null && status !== GenerationRequestStatus.Completed && status !== GenerationRequestStatus.Failed) {
    console.warn('[credit-service] Not settling a paid run whose request is not finished', generationRequestId, status);
    return;
  }

  await closeReportSpend(spend, status === GenerationRequestStatus.Completed);
}

type OpenSpend = ReportSpend & { user: { stripeCustomerId: string | null } };

async function findOpenSpend(generationRequestId: string): Promise<OpenSpend | null> {
  const spend = await prisma.reportSpend.findUnique({
    where: { generationRequestId },
    include: { user: { select: { stripeCustomerId: true } } },
  });
  return spend?.status === ReportSpendStatus.InProgress ? spend : null;
}

/** The request's stored status, or null when it no longer exists. Stock and ETF requests share the same status strings. */
async function storedRequestStatus(reportKind: CreditReportKind, generationRequestId: string): Promise<string | null> {
  const where = { id: generationRequestId };
  const select = { status: true } as const;
  const request =
    reportKind === CreditReportKind.Stock
      ? await prisma.tickerV1GenerationRequest.findUnique({ where, select })
      : await prisma.etfGenerationRequest.findUnique({ where, select });
  return request?.status ?? null;
}

/**
 * Charges (on success) and closes the spend. The charge is retried once (see
 * `chargeReportWithRetry`); if both attempts fail the run is still closed as
 * Completed — the user keeps the report for free rather than being stuck with a
 * reserved credit. The user who paid is emailed the result (best effort).
 */
async function closeReportSpend(spend: OpenSpend, succeeded: boolean): Promise<void> {
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
 * Charges the report, retrying once on error. Each attempt first looks for a
 * charge already written for this run (read-only) and reuses it: the
 * idempotency key only lasts 24h, and a settle that crashed between charging and
 * closing its row may only be reconciled later than that. An error doesn't mean
 * the charge didn't land (a timeout or reset connection can hide a success); the
 * retry reuses the same idempotency key, so Stripe hands back the original
 * transaction instead of charging again. Returns null only when both attempts
 * fail — the report is then kept free of charge.
 */
export async function chargeReportWithRetry(input: ChargeReportInput, retryDelayMs = CHARGE_RETRY_DELAY_MS): Promise<Stripe.CustomerBalanceTransaction | null> {
  const attempt = async () => (await findReportChargeInStripe(input.stripeCustomerId, input.generationRequestId)) ?? (await chargeReportInStripe(input));
  try {
    return await attempt();
  } catch (firstError) {
    console.warn('[credit-service] Stripe charge errored; retrying with the same idempotency key', input.generationRequestId, firstError);
  }
  await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  try {
    return await attempt();
  } catch (error) {
    await logError(
      '[credit-service] Stripe report charge failed twice; report kept free of charge',
      { generationRequestId: input.generationRequestId, userId: input.userId, reportLabel: input.reportLabel },
      error instanceof Error ? error : null
    );
    return null;
  }
}

/** At most this many stale runs are settled per user call (spend / page nudge). */
const STALE_SETTLE_BATCH = 5;
/** At most this many stale runs are settled per heartbeat tick, across all users. */
const STALE_SETTLE_GLOBAL_BATCH = 10;
/** How many open spends one reconciliation pass looks at (still-running ones are skipped cheaply). */
const STALE_SCAN_LIMIT = 50;
/**
 * A finished request is only treated as stale this long after it ended, so the
 * reconciliation doesn't race the normal settle that follows markAsCompleted.
 */
const STALE_SETTLE_GRACE_MS = 2 * 60 * 1000;
/** A paid run whose request still hasn't finished after this long is stuck: release its credit. */
const STUCK_SPEND_MS = 12 * 60 * 60 * 1000;

/**
 * Settles this user's paid runs whose generation request has already finished
 * but whose ReportSpend is still InProgress — e.g. the settle after
 * markAsCompleted crashed or timed out on Stripe — and releases runs stuck for
 * over 12 hours. Bounded and idempotent. Returns how many runs were settled.
 */
export function settleStaleReportSpends(userId: string): Promise<number> {
  return reconcileOpenSpends({ userId }, STALE_SETTLE_BATCH);
}

/**
 * The same reconciliation for every user, at most `STALE_SETTLE_GLOBAL_BATCH`
 * runs per call. Driven by the generation heartbeat (processPendingTickerRequests),
 * so nothing on a page read waits for it.
 */
export function settleStaleReportSpendsForAllUsers(): Promise<number> {
  return reconcileOpenSpends({}, STALE_SETTLE_GLOBAL_BATCH);
}

async function reconcileOpenSpends(where: Prisma.ReportSpendWhereInput, maxSettles: number): Promise<number> {
  const now = Date.now();
  const cutoff = new Date(now - STALE_SETTLE_GRACE_MS);
  const openSpends = await prisma.reportSpend.findMany({
    where: { ...where, status: ReportSpendStatus.InProgress, createdAt: { lt: cutoff } },
    orderBy: { createdAt: 'asc' },
    take: STALE_SCAN_LIMIT,
    select: { generationRequestId: true, reportKind: true, createdAt: true, userId: true, reportLabel: true },
  });
  if (openSpends.length === 0) {
    return 0;
  }

  const requestsById = await loadRequestEnds(openSpends);
  let settledCount = 0;
  for (const spend of openSpends) {
    if (settledCount >= maxSettles) {
      break;
    }
    const request = requestsById.get(spend.generationRequestId);
    const finished = !request || request.status === GenerationRequestStatus.Completed || request.status === GenerationRequestStatus.Failed;
    if (finished) {
      // Missing request → settleReportCredit releases it. Otherwise wait out the grace period after it ended.
      if (request && (request.completedAt ?? request.updatedAt) >= cutoff) {
        continue;
      }
      console.log('[credit-service] Settling stale paid run', spend.generationRequestId, request?.status ?? 'request deleted');
      await settleReportCredit(spend.generationRequestId);
      settledCount++;
    } else if (spend.createdAt.getTime() < now - STUCK_SPEND_MS) {
      await releaseStuckReportSpend(spend, request.status);
      settledCount++;
    }
  }
  return settledCount;
}

/** A paid run whose request never finished: something stalled. Release the credit uncharged and alert. */
async function releaseStuckReportSpend(
  stuck: { generationRequestId: string; userId: string; reportLabel: string; createdAt: Date },
  requestStatus: string
): Promise<void> {
  await logError('[credit-service] Releasing a stuck paid report run (request still not finished after 12h); not charged', {
    generationRequestId: stuck.generationRequestId,
    userId: stuck.userId,
    reportLabel: stuck.reportLabel,
    requestStatus,
    spendCreatedAt: stuck.createdAt.toISOString(),
  });
  const spend = await findOpenSpend(stuck.generationRequestId);
  if (spend) {
    await closeReportSpend(spend, false);
  }
}

interface RequestEnd {
  id: string;
  status: string;
  completedAt: Date | null;
  updatedAt: Date;
}

/** The current state of each spend's request. Stock and ETF requests live in different tables but share the same status strings. */
async function loadRequestEnds(spends: { generationRequestId: string; reportKind: CreditReportKind }[]): Promise<Map<string, RequestEnd>> {
  const idsOf = (kind: CreditReportKind): string[] => spends.filter((spend) => spend.reportKind === kind).map((spend) => spend.generationRequestId);
  const stockIds = idsOf(CreditReportKind.Stock);
  const etfIds = idsOf(CreditReportKind.Etf);
  const select = { id: true, status: true, completedAt: true, updatedAt: true } as const;

  const [stockRequests, etfRequests]: [RequestEnd[], RequestEnd[]] = await Promise.all([
    stockIds.length ? prisma.tickerV1GenerationRequest.findMany({ where: { id: { in: stockIds } }, select }) : Promise.resolve([]),
    etfIds.length ? prisma.etfGenerationRequest.findMany({ where: { id: { in: etfIds } }, select }) : Promise.resolve([]),
  ]);
  return new Map([...stockRequests, ...etfRequests].map((request) => [request.id, request]));
}

/** Reconciliation is best effort on read paths: it must never break the page or the spend. */
async function settleStaleReportSpendsSafely(userId: string): Promise<void> {
  try {
    await settleStaleReportSpends(userId);
  } catch (error) {
    console.error('[credit-service] Settling stale paid runs failed', userId, error);
  }
}
