import { prisma } from '@/prisma';
import { CREDITS_PER_REPORT } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { sendReportResultEmail } from '@/utils/credits/report-result-email';
import { chargeReportInStripe, fetchStripeCredits, getCachedStripeCredits, grantPurchaseInStripe } from '@/utils/credits/stripe-credit-ledger';
import { CreditReportKind, Prisma, ReportSpendStatus } from '@prisma/client';

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
}

/**
 * The user's spendable balance for display. A user who never bought costs no
 * Stripe call; everyone else reads a cached balance (see `getCachedStripeCredits`).
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  const [user, reservedCredits] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { stripeCustomerId: true, firstPurchaseAt: true } }),
    countReservedCredits(prisma, userId),
  ]);
  if (!user.firstPurchaseAt || !user.stripeCustomerId) {
    return { credits: 0, reservedCredits };
  }
  // Every balance change we make adds one of these rows, so their counts version the cache.
  const [purchases, charges] = await Promise.all([
    prisma.stripeCreditPurchase.count({ where: { userId } }),
    prisma.reportSpend.count({ where: { userId, stripeDebitTxnId: { not: null } } }),
  ]);
  const stripeCredits = await getCachedStripeCredits(user.stripeCustomerId, `${purchases}-${charges}`);
  return { credits: Math.max(0, stripeCredits - reservedCredits), reservedCredits };
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

  const alreadyGranted = await prisma.stripeCreditPurchase.findUnique({ where: { stripeCheckoutSessionId }, select: { id: true } });
  if (alreadyGranted) {
    return { granted: false };
  }

  const creditTxn = await grantPurchaseInStripe(input);

  try {
    await prisma.stripeCreditPurchase.create({
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
    });
  } catch (error) {
    // Two concurrent deliveries got the same Stripe transaction back; the other one recorded it.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { granted: false };
    }
    throw error;
  }

  await prisma.user.updateMany({ where: { id: userId, firstPurchaseAt: null }, data: { firstPurchaseAt: new Date() } });
  return { granted: true };
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

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { stripeCustomerId: true, firstPurchaseAt: true } });
  const stripeCustomerId = user.stripeCustomerId;
  if (!user.firstPurchaseAt || !stripeCustomerId) {
    return { outcome: 'InsufficientCredits' };
  }

  return prisma.$transaction(
    async (tx): Promise<SpendCreditResult<T>> => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const openSpendOnTarget = await tx.reportSpend.findFirst({
        where: { userId, reportTargetId, status: ReportSpendStatus.InProgress },
        select: { id: true },
      });
      if (openSpendOnTarget) {
        return { outcome: 'AlreadyInProgress' };
      }

      const [stripeCredits, reservedCredits] = await Promise.all([fetchStripeCredits(stripeCustomerId), countReservedCredits(tx, userId)]);
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
    // The live Stripe read happens inside the transaction, so allow for its latency.
    { timeout: 15_000 }
  );
}

/**
 * Closes out the credit reserved for a finished generation request.
 *
 * Success charges one credit in Stripe; failure (including a partial run, since
 * the user paid for a full report) charges nothing. If the Stripe charge itself
 * fails the run is still closed as Completed — the user keeps the report for
 * free rather than being stuck with a reserved credit. Either way the user who
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
    try {
      // Charged before the row is closed: until it is, the credit still counts
      // as reserved, so the spendable balance can never briefly overstate.
      const debit = await chargeReportInStripe({ ...spend, stripeCustomerId: spend.user.stripeCustomerId });
      stripeDebitTxnId = debit.id;
    } catch (error) {
      console.error('[credit-service] Stripe charge failed; report kept free of charge', generationRequestId, error);
    }
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
