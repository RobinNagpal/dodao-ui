import { prisma } from '@/prisma';
import { CREDITS_PER_REPORT } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { sendReportResultEmail } from '@/utils/credits/report-result-email';
import { CreditReportKind, CreditTransactionType, Prisma } from '@prisma/client';

/**
 * Credit accounting.
 *
 * `User.credits` is the spendable balance and `CreditTransaction` is the
 * append-only ledger that explains it. Every function here writes both inside
 * one DB transaction, so the balance can always be re-derived from the ledger
 * and a crash mid-way can never leave a user paid-but-not-credited (or
 * charged-but-not-generated).
 */

export interface GrantPurchasedCreditsInput {
  userId: string;
  credits: number;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  amountInCents: number;
  currency: string;
}

export interface GrantPurchasedCreditsResult {
  /** False when this checkout session had already been credited. */
  granted: boolean;
  credits: number;
}

/**
 * Credits a completed Stripe Checkout Session. Idempotent on the session id:
 * Stripe retries webhook deliveries, and a replay must never pay out twice.
 */
export async function grantPurchasedCredits(input: GrantPurchasedCreditsInput): Promise<GrantPurchasedCreditsResult> {
  const { userId, credits, stripeCheckoutSessionId } = input;

  const alreadyGranted = await prisma.creditTransaction.findUnique({
    where: { stripeCheckoutSessionId },
    select: { balanceAfter: true },
  });
  if (alreadyGranted) {
    return { granted: false, credits: alreadyGranted.balanceAfter };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: credits } },
        select: { credits: true },
      });

      await tx.creditTransaction.create({
        data: {
          userId,
          spaceId: KoalaGainsSpaceId,
          type: CreditTransactionType.Purchase,
          credits,
          balanceAfter: user.credits,
          description: `Purchased ${credits} ${credits === 1 ? 'credit' : 'credits'}`,
          stripeCheckoutSessionId,
          stripePaymentIntentId: input.stripePaymentIntentId,
          amountInCents: input.amountInCents,
          currency: input.currency,
        },
      });

      return { granted: true, credits: user.credits };
    });
  } catch (error) {
    // Two concurrent deliveries of the same event: the loser hits the unique
    // index on stripe_checkout_session_id and its whole transaction (including
    // the balance increment) rolls back. The winner already credited the user.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.creditTransaction.findUnique({
        where: { stripeCheckoutSessionId },
        select: { balanceAfter: true },
      });
      return { granted: false, credits: existing?.balanceAfter ?? 0 };
    }
    throw error;
  }
}

export interface SpendCreditInput {
  userId: string;
  reportKind: CreditReportKind;
  reportTargetId: string;
  /** Human-readable "AAPL (NASDAQ)" used in the credit history. */
  reportLabel: string;
}

export type SpendCreditResult<T> =
  | { outcome: 'Started'; generationRequest: T; credits: number }
  | { outcome: 'InsufficientCredits' }
  | { outcome: 'AlreadyInProgress' };

export interface SpendCreditTarget<T> {
  createGenerationRequest: (tx: Prisma.TransactionClient) => Promise<T>;
}

/** Thrown inside the transaction to roll the deduction back. */
class SpendAlreadyOpenError extends Error {}

/**
 * Deducts one credit and creates the generation request it pays for, atomically.
 *
 * The deduction is a conditional `updateMany` (`credits >= cost`) rather than a
 * read-then-write, so two simultaneous clicks cannot both spend the same last
 * credit. If `createGenerationRequest` throws, the whole transaction — the
 * deduction included — rolls back.
 *
 * Runs started by an admin or the nightly job don't block a paid run: the user
 * gets their own request. Only the user's own unfinished paid run does, so a
 * double click or a second tab can't charge twice. That check sits after the
 * deduction on purpose: the deduction row-locks the user, so a concurrent click
 * waits here until the first commits, then sees its spend and rolls back.
 */
export async function spendCreditForReport<T extends { id: string }>(input: SpendCreditInput, target: SpendCreditTarget<T>): Promise<SpendCreditResult<T>> {
  const { userId, reportKind, reportTargetId, reportLabel } = input;

  try {
    return await prisma.$transaction(async (tx): Promise<SpendCreditResult<T>> => {
      const deducted = await tx.user.updateMany({
        where: { id: userId, credits: { gte: CREDITS_PER_REPORT } },
        data: { credits: { decrement: CREDITS_PER_REPORT } },
      });

      if (deducted.count === 0) {
        return { outcome: 'InsufficientCredits' };
      }

      const openSpends = await tx.creditTransaction.count({
        where: { userId, reportTargetId, type: CreditTransactionType.ReportSpend, settledAt: null },
      });
      if (openSpends > 0) {
        throw new SpendAlreadyOpenError();
      }

      const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } });
      const generationRequest = await target.createGenerationRequest(tx);

      await tx.creditTransaction.create({
        data: {
          userId,
          spaceId: KoalaGainsSpaceId,
          type: CreditTransactionType.ReportSpend,
          credits: -CREDITS_PER_REPORT,
          balanceAfter: user.credits,
          description: `Report generation for ${reportLabel}`,
          reportKind,
          reportTargetId,
          reportLabel,
          generationRequestId: generationRequest.id,
        },
      });

      return { outcome: 'Started', generationRequest, credits: user.credits };
    });
  } catch (error) {
    if (error instanceof SpendAlreadyOpenError) {
      return { outcome: 'AlreadyInProgress' };
    }
    throw error;
  }
}

/**
 * Closes out the credit held for a finished generation request.
 *
 * A request that ends in `Failed` gets the credit back — including the partial
 * case where some sections succeeded, since the user paid for a full report.
 * Either way the user who paid is emailed the result (best effort).
 * A no-op for admin- and cron-created requests, which have no ledger row.
 */
export async function settleReportCredit(generationRequestId: string, succeeded: boolean): Promise<void> {
  const spend = await prisma.creditTransaction.findFirst({
    where: {
      generationRequestId,
      type: CreditTransactionType.ReportSpend,
      settledAt: null,
    },
  });

  if (!spend) {
    return;
  }

  if (succeeded) {
    const settled = await prisma.creditTransaction.updateMany({
      where: { id: spend.id, settledAt: null },
      data: { settledAt: new Date() },
    });
    // Only the call that actually settled it emails, so a concurrent settle can't send twice.
    if (settled.count > 0) {
      await sendReportResultEmail(spend, true);
    }
    return;
  }

  const refunded = await prisma.$transaction(async (tx): Promise<boolean> => {
    // Settling and refunding are guarded by the same `settledAt: null` filter,
    // so a concurrent settle can't hand out the refund twice.
    const settled = await tx.creditTransaction.updateMany({
      where: { id: spend.id, settledAt: null },
      data: { settledAt: new Date() },
    });

    if (settled.count === 0) {
      return false;
    }

    const user = await tx.user.update({
      where: { id: spend.userId },
      data: { credits: { increment: CREDITS_PER_REPORT } },
      select: { credits: true },
    });

    await tx.creditTransaction.create({
      data: {
        userId: spend.userId,
        spaceId: spend.spaceId,
        type: CreditTransactionType.Refund,
        credits: CREDITS_PER_REPORT,
        balanceAfter: user.credits,
        description: `Refund for failed report: ${spend.reportLabel ?? 'a report'}`,
        reportKind: spend.reportKind,
        reportTargetId: spend.reportTargetId,
        reportLabel: spend.reportLabel,
        generationRequestId,
        settledAt: new Date(),
      },
    });
    return true;
  });

  // Sent after the transaction commits, so the email never claims a refund that rolled back.
  if (refunded) {
    await sendReportResultEmail(spend, false);
  }
}
