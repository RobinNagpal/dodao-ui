import { prisma } from '@/prisma';
import { CENTS_PER_CREDIT, CREDIT_CURRENCY, getCreditPack } from '@/types/credits';
import { grantPurchasedCredits } from '@/utils/credits/credit-service';
import { getStripeClient } from '@/utils/credits/stripe-client';
import { LEDGER_ENTRY_TYPE, listRecentLedgerEntries, postReversalDebitInStripe, ReversalDebitInput } from '@/utils/credits/stripe-credit-ledger';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';

/**
 * Purchase side of the credit workflow: turning a paid Checkout Session into
 * credits (shared by the webhook and the return-page confirmation, so both
 * paths are the same code), and taking credits back on refunds and disputes.
 */

/** What a credits Checkout Session says about who bought what. */
export interface CreditsSessionMetadata {
  userId: string;
  credits: number;
  /** What the pack costs in USD cents — our price, never a converted Stripe amount. */
  amountInCents: number;
}

/**
 * The metadata the checkout-session route writes, or null when the session is
 * not one of our credits sessions (or the metadata is unusable).
 */
export function readCreditsSessionMetadata(session: Stripe.Checkout.Session): CreditsSessionMetadata | null {
  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits);
  if (!userId || !Number.isInteger(credits) || credits <= 0) {
    return null;
  }
  // Every pack costs exactly $1 × credits; the pack lookup is just the source of truth for it.
  const pack = getCreditPack(session.metadata?.packKey ?? '');
  const amountInCents = pack && pack.credits === credits ? pack.amountInCents : credits * CENTS_PER_CREDIT;
  return { userId, credits, amountInCents };
}

export type CheckoutPaymentState = 'paid' | 'pending' | 'not_paid';

/**
 * `paid` buys credits. A completed session that is still `unpaid` was paid with
 * a delayed method (e.g. a bank debit) that hasn't cleared — the
 * `async_payment_succeeded` webhook grants it later. Anything else is unpaid.
 */
export function checkoutPaymentState(session: Stripe.Checkout.Session): CheckoutPaymentState {
  if (session.payment_status === 'paid') return 'paid';
  if (session.status === 'complete' && session.payment_status === 'unpaid') return 'pending';
  return 'not_paid';
}

export type CheckoutGrantResult = 'credited' | 'already_credited' | 'pending' | 'not_paid' | 'not_credits_session' | 'unknown_user';

/**
 * Balance reads and spends use `users.stripeCustomerId`, so the customer we
 * credit must be that one. If the user has none yet, link the session's
 * customer. If it's a different one, the credit is still granted to the
 * customer that paid (money is never dropped), but the user won't see it until
 * someone repairs the link by hand — hence the alert.
 */
export async function linkOrCheckStripeCustomer(userId: string, sessionCustomerId: string, sessionId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
  let linkedCustomerId = user?.stripeCustomerId ?? null;
  if (!linkedCustomerId) {
    try {
      const linked = await prisma.user.updateMany({ where: { id: userId, stripeCustomerId: null }, data: { stripeCustomerId: sessionCustomerId } });
      if (linked.count === 1) {
        return;
      }
    } catch (error) {
      // stripeCustomerId is unique: this customer is already linked to another user.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
        throw error;
      }
      await logError('[credit-purchase] MANUAL REPAIR NEEDED: checkout customer is linked to a different user; credits granted to it anyway', {
        sessionId,
        userId,
        sessionCustomerId,
      });
      return;
    }
    // Linked concurrently (e.g. a checkout being created right now): compare against that.
    linkedCustomerId = (await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } }))?.stripeCustomerId ?? null;
  }

  if (linkedCustomerId !== sessionCustomerId) {
    await logError(
      "[credit-purchase] MANUAL REPAIR NEEDED: checkout customer differs from the user's linked Stripe customer; credits granted to the checkout customer",
      {
        sessionId,
        userId,
        sessionCustomerId,
        linkedCustomerId,
      }
    );
  }
}

/**
 * Grants the credits of a paid credits Checkout Session, exactly once. The
 * webhook and `confirm-checkout` both call this, so a race between them is the
 * same as two webhook deliveries: `grantPurchasedCredits` is idempotent (Stripe
 * idempotency key + ledger search + unique session id), and exactly one of them
 * reports `credited`.
 */
export async function creditCheckoutSession(session: Stripe.Checkout.Session, source: string): Promise<CheckoutGrantResult> {
  const metadata = readCreditsSessionMetadata(session);
  if (!metadata) {
    console.error(`[credit-purchase] (${source}) Checkout session is missing usable credits metadata`, session.id, session.metadata);
    return 'not_credits_session';
  }

  const state = checkoutPaymentState(session);
  if (state !== 'paid') {
    console.log(`[credit-purchase] (${source}) Checkout session not paid yet`, session.id, session.status, session.payment_status);
    return state;
  }

  const { userId, credits, amountInCents } = metadata;

  // Checkout sessions are always created for the user's Stripe customer, so the
  // credit goes onto that customer's balance.
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (!stripeCustomerId) {
    await logError(`[credit-purchase] (${source}) MANUAL REPAIR NEEDED: paid checkout session has no customer; nothing credited`, {
      sessionId: session.id,
      userId,
      credits,
    });
    return 'not_credits_session';
  }

  // A deleted user can't be credited (the purchase row would violate its FK),
  // and retrying won't bring them back. Checked before any Stripe write.
  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!userExists) {
    console.error(`[credit-purchase] (${source}) Paid checkout session belongs to a user that no longer exists; not crediting`, {
      sessionId: session.id,
      userId,
      stripeCustomerId,
      credits,
    });
    return 'unknown_user';
  }

  await linkOrCheckStripeCustomer(userId, stripeCustomerId, session.id);

  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

  const result = await grantPurchasedCredits({
    userId,
    stripeCustomerId,
    credits,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    amountInCents,
    currency: CREDIT_CURRENCY,
  });

  console.log(
    result.granted
      ? `[credit-purchase] (${source}) Granted ${credits} credits to ${userId} for ${session.id}`
      : `[credit-purchase] (${source}) Checkout session ${session.id} was already credited`
  );
  return result.granted ? 'credited' : 'already_credited';
}

const CHECKOUT_SESSION_ID_PATTERN = /^cs_(live|test)_[A-Za-z0-9]+$/;

export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 255 && CHECKOUT_SESSION_ID_PATTERN.test(value);
}

/**
 * Confirms a Checkout Session the user just came back from. Read-only towards
 * Stripe except for the (idempotent) grant itself. Returns null when the session
 * doesn't exist, isn't a credits session, or belongs to someone else — the
 * caller answers all three with the same 404 so session ids can't be probed.
 */
export async function confirmCheckoutForUser(userId: string, sessionId: string): Promise<'credited' | 'already_credited' | 'pending' | 'not_paid' | null> {
  let session: Stripe.Checkout.Session;
  try {
    session = await (await getStripeClient()).checkout.sessions.retrieve(sessionId);
  } catch (error) {
    // e.g. a test-mode id against the live key, or a made-up id.
    if ((error as { code?: string })?.code === 'resource_missing') {
      return null;
    }
    throw error;
  }

  const metadata = readCreditsSessionMetadata(session);
  if (!metadata || metadata.userId !== userId) {
    return null;
  }

  const result = await creditCheckoutSession(session, 'confirm-checkout');
  switch (result) {
    case 'credited':
    case 'already_credited':
    case 'pending':
    case 'not_paid':
      return result;
    default:
      // The session is the logged-in user's own, so these can't really happen; nothing was granted.
      return 'not_paid';
  }
}

// ---------------------------------------------------------------------------
// Refunds and disputes
// ---------------------------------------------------------------------------

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

interface PurchaseForReversal {
  userId: string;
  credits: number;
  amountInCents: number;
  stripeCheckoutSessionId: string;
  paymentIntentId: string;
  stripeCustomerId: string;
}

/**
 * The credits purchase a charge paid for, with the customer its credits went
 * to. Null (logged) when the charge wasn't a credits purchase.
 */
async function findPurchaseForCharge(paymentIntentId: string | null, chargeCustomerId: string | null, what: string): Promise<PurchaseForReversal | null> {
  if (!paymentIntentId) {
    console.log(`[credit-purchase] ${what}: charge has no payment intent; not a credits purchase, ignoring`);
    return null;
  }
  const purchase = await prisma.stripeCreditPurchase.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { userId: true, credits: true, amountInCents: true, stripeCheckoutSessionId: true, user: { select: { stripeCustomerId: true } } },
  });
  if (!purchase) {
    console.log(`[credit-purchase] ${what}: no credits purchase for payment intent ${paymentIntentId}, ignoring`);
    return null;
  }
  const stripeCustomerId = chargeCustomerId ?? purchase.user.stripeCustomerId;
  if (!stripeCustomerId) {
    throw new Error(`${what}: credits purchase for ${paymentIntentId} has no Stripe customer to debit`);
  }
  return {
    userId: purchase.userId,
    credits: purchase.credits,
    amountInCents: purchase.amountInCents,
    stripeCheckoutSessionId: purchase.stripeCheckoutSessionId,
    paymentIntentId,
    stripeCustomerId,
  };
}

/** Posts one reversal debit unless the recent ledger already has it. */
async function postReversalOnce(input: ReversalDebitInput, ledger: Stripe.CustomerBalanceTransaction[]): Promise<void> {
  const existing = ledger.find((entry) => entry.metadata?.type === input.type && entry.metadata?.sourceId === input.sourceId);
  if (existing) {
    console.log(`[credit-purchase] ${input.type} ${input.sourceId} already removed ${input.credits} credits (${existing.id}); skipping`);
    return;
  }
  const debit = await postReversalDebitInStripe(input);
  console.log(
    `[credit-purchase] Removed ${input.credits} credits from ${input.userId} (${input.stripeCustomerId}) for ${input.type} ${input.sourceId} on ${input.paymentIntentId}: ${debit.id}`
  );
}

/**
 * Credits to remove for each refund of a purchase, keyed by refund id.
 *
 * Proportional and cumulative: after refunds totalling R cents, the purchase has
 * lost `floor(credits × R / amountInCents)` credits. Each refund's share is the
 * step it adds to that total, in the order the refunds were created, so it is
 * deterministic per refund id — a replayed or concurrent event computes the same
 * amount and therefore the same idempotent Stripe request.
 */
export function creditsToRemovePerRefund(
  purchase: { credits: number; amountInCents: number },
  refunds: { id: string; amount: number; created: number; status: string | null }[]
): Map<string, number> {
  const ordered = refunds
    .filter((refund) => refund.status !== 'failed' && refund.status !== 'canceled')
    .sort((a, b) => a.created - b.created || a.id.localeCompare(b.id));
  const result = new Map<string, number>();
  let refundedCents = 0;
  let removedCredits = 0;
  for (const refund of ordered) {
    refundedCents += refund.amount;
    const total = purchase.amountInCents > 0 ? Math.min(purchase.credits, Math.floor((purchase.credits * refundedCents) / purchase.amountInCents)) : 0;
    result.set(refund.id, total - removedCredits);
    removedCredits = total;
  }
  return result;
}

/** `charge.refunded`: take back the refunded share of the purchase's credits. */
export async function reverseRefundedCharge(charge: Stripe.Charge): Promise<void> {
  const what = `charge.refunded ${charge.id}`;
  const purchase = await findPurchaseForCharge(idOf(charge.payment_intent), idOf(charge.customer), what);
  if (!purchase) return;

  // `charge.refunds` isn't included in webhook payloads on current API versions; list them (read-only).
  const refunds = await (await getStripeClient()).refunds.list({ charge: charge.id, limit: 100 });
  const perRefund = creditsToRemovePerRefund(purchase, refunds.data);
  const ledger = await listRecentLedgerEntries(purchase.stripeCustomerId);

  for (const [refundId, credits] of perRefund) {
    if (credits <= 0) {
      console.log(`[credit-purchase] ${what}: refund ${refundId} is too small to remove a whole credit; nothing removed`);
      continue;
    }
    await postReversalOnce(
      {
        stripeCustomerId: purchase.stripeCustomerId,
        userId: purchase.userId,
        credits,
        type: LEDGER_ENTRY_TYPE.Refund,
        sourceId: refundId,
        paymentIntentId: purchase.paymentIntentId,
        checkoutSessionId: purchase.stripeCheckoutSessionId,
      },
      ledger
    );
  }
}

/** The credits purchase a dispute is about. The dispute doesn't carry the customer; its charge does (read-only GET). */
async function findPurchaseForDispute(dispute: Stripe.Dispute, what: string): Promise<PurchaseForReversal | null> {
  let paymentIntentId = idOf(dispute.payment_intent);
  let customerId: string | null = null;
  const chargeId = idOf(dispute.charge);
  if (chargeId) {
    const charge = await (await getStripeClient()).charges.retrieve(chargeId);
    customerId = idOf(charge.customer);
    paymentIntentId = paymentIntentId ?? idOf(charge.payment_intent);
  }
  return findPurchaseForCharge(paymentIntentId, customerId, what);
}

/** Credits the recent ledger shows were already taken back by refunds of this purchase. */
function creditsRemovedByRefunds(purchase: PurchaseForReversal, ledger: Stripe.CustomerBalanceTransaction[]): number {
  return ledger
    .filter(
      (entry) => entry.metadata?.type === LEDGER_ENTRY_TYPE.Refund && entry.metadata?.paymentIntentId === purchase.paymentIntentId && entry.metadata?.sourceId
    )
    .reduce((sum, entry) => sum + (Number(entry.metadata?.credits) || 0), 0);
}

/** `charge.dispute.created`: take back all of the purchase's credits not already removed by a refund. */
export async function reverseDisputedCharge(dispute: Stripe.Dispute): Promise<void> {
  const what = `charge.dispute.created ${dispute.id}`;
  const purchase = await findPurchaseForDispute(dispute, what);
  if (!purchase) return;

  const ledger = await listRecentLedgerEntries(purchase.stripeCustomerId);
  const credits = purchase.credits - creditsRemovedByRefunds(purchase, ledger);
  if (credits <= 0) {
    console.log(`[credit-purchase] ${what}: purchase ${purchase.paymentIntentId} was already fully refunded in credits; nothing removed`);
    return;
  }

  await postReversalOnce(
    {
      stripeCustomerId: purchase.stripeCustomerId,
      userId: purchase.userId,
      credits,
      type: LEDGER_ENTRY_TYPE.Dispute,
      sourceId: dispute.id,
      paymentIntentId: purchase.paymentIntentId,
      checkoutSessionId: purchase.stripeCheckoutSessionId,
    },
    ledger
  );
}

/** `metadata.type` of the credit that gives a won dispute's credits back. Shows in the history as an `Adjustment`. */
const DISPUTE_WON_ENTRY_TYPE = 'dispute_won';

/**
 * `charge.dispute.closed`: a won dispute gives back exactly what its
 * `charge.dispute.created` debit took — and nothing if there was no debit (the
 * purchase was already fully refunded in credits, or isn't ours). Any other
 * outcome (lost, warning closed, …) leaves the debit standing.
 *
 * At most once per dispute, the same two layers as the debit: idempotency key
 * `credit-dispute-won-<du_…>` for concurrent / retried deliveries within 24h,
 * and a recent-ledger check for a `dispute_won` entry with this `sourceId`.
 */
export async function restoreWonDispute(dispute: Stripe.Dispute): Promise<void> {
  const what = `charge.dispute.closed ${dispute.id}`;
  if (dispute.status !== 'won') {
    console.log(`[credit-purchase] ${what}: closed as ${dispute.status}; the dispute debit (if any) stands`);
    return;
  }
  const purchase = await findPurchaseForDispute(dispute, what);
  if (!purchase) return;

  const ledger = await listRecentLedgerEntries(purchase.stripeCustomerId);
  const restored = ledger.find((entry) => entry.metadata?.type === DISPUTE_WON_ENTRY_TYPE && entry.metadata?.sourceId === dispute.id);
  if (restored) {
    console.log(`[credit-purchase] ${what}: credits already restored (${restored.id}); skipping`);
    return;
  }

  const debit = ledger.find((entry) => entry.metadata?.type === LEDGER_ENTRY_TYPE.Dispute && entry.metadata?.sourceId === dispute.id);
  if (!debit) {
    if (purchase.credits - creditsRemovedByRefunds(purchase, ledger) <= 0) {
      console.log(
        `[credit-purchase] ${what}: purchase ${purchase.paymentIntentId} was fully refunded in credits, so the dispute debited nothing; nothing to restore`
      );
      return;
    }
    // Most likely the debit is older than the ledger lookback (disputes can take months to close) — restore it by
    // hand, see the runbook. Also hit if the `charge.dispute.created` debit never landed.
    await logError(`[credit-purchase] MANUAL CHECK NEEDED: ${what} was won but its dispute debit is not in the recent ledger; nothing restored`, {
      disputeId: dispute.id,
      userId: purchase.userId,
      stripeCustomerId: purchase.stripeCustomerId,
      paymentIntentId: purchase.paymentIntentId,
    });
    return;
  }

  const credits = Number(debit.metadata?.credits) || 0;
  const credit = await (
    await getStripeClient()
  ).customers.createBalanceTransaction(
    purchase.stripeCustomerId,
    {
      // Exactly the debit's amount, negated: a negative balance change is credit.
      amount: -debit.amount,
      currency: debit.currency,
      description: `Restored ${credits} ${credits === 1 ? 'credit' : 'credits'} (payment dispute won)`,
      metadata: {
        type: DISPUTE_WON_ENTRY_TYPE,
        userId: purchase.userId,
        credits: String(credits),
        sourceId: dispute.id,
        debitTxnId: debit.id,
        paymentIntentId: purchase.paymentIntentId,
        checkoutSessionId: purchase.stripeCheckoutSessionId,
      },
    },
    { idempotencyKey: `credit-dispute-won-${dispute.id}` }
  );
  console.log(
    `[credit-purchase] Restored ${credits} credits to ${purchase.userId} (${purchase.stripeCustomerId}) for won dispute ${dispute.id} on ${purchase.paymentIntentId}: ${credit.id}`
  );
}
