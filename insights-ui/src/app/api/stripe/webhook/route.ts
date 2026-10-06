import { prisma } from '@/prisma';
import { grantPurchasedCredits } from '@/utils/credits/credit-service';
import { getStripeClient, getStripeWebhookSecret } from '@/utils/credits/stripe-client';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Signature verification needs the exact bytes Stripe signed, so this route
// reads the raw body itself and must run on Node, not the edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Events that mean "the money for this checkout session has arrived". */
const CREDITING_EVENTS = new Set<string>(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

/**
 * Balance reads and spends use `users.stripeCustomerId`, so the customer we
 * credit must be that one. If the user has none yet, link the session's
 * customer. If it's a different one, the credit is still granted to the
 * customer that paid (money is never dropped), but the user won't see it until
 * someone repairs the link by hand — hence the loud error.
 */
async function linkOrCheckStripeCustomer(userId: string, sessionCustomerId: string, sessionId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
  if (!user) {
    console.error('[stripe-webhook] Checkout session belongs to an unknown user', sessionId, userId);
    return;
  }

  let linkedCustomerId = user.stripeCustomerId;
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
      console.error('[stripe-webhook] MANUAL REPAIR NEEDED: checkout customer is linked to a different user; credits granted to it anyway', {
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
    console.error(
      "[stripe-webhook] MANUAL REPAIR NEEDED: checkout customer differs from the user's linked Stripe customer; credits granted to the checkout customer",
      {
        sessionId,
        userId,
        sessionCustomerId,
        linkedCustomerId,
      }
    );
  }
}

async function creditCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  // `completed` also fires for sessions whose payment is still pending (some
  // bank-backed methods). Only a paid session buys credits.
  if (session.payment_status !== 'paid') {
    console.log('[stripe-webhook] Ignoring unpaid checkout session', session.id, session.payment_status);
    return;
  }

  const userId = session.metadata?.userId;
  const credits = Number(session.metadata?.credits);

  if (!userId || !Number.isInteger(credits) || credits <= 0) {
    console.error('[stripe-webhook] Checkout session is missing usable metadata', session.id, session.metadata);
    return;
  }

  // Checkout sessions are always created for the user's Stripe customer, so the
  // credit goes onto that customer's balance.
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (!stripeCustomerId) {
    console.error('[stripe-webhook] Checkout session has no customer', session.id);
    return;
  }

  await linkOrCheckStripeCustomer(userId, stripeCustomerId, session.id);

  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

  const result = await grantPurchasedCredits({
    userId,
    stripeCustomerId,
    credits,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    amountInCents: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
  });

  console.log(
    result.granted ? `[stripe-webhook] Granted ${credits} credits to ${userId}` : `[stripe-webhook] Checkout session ${session.id} was already credited`
  );
}

// POST /api/stripe/webhook — Stripe's payment notifications. Unauthenticated by
// design; the Stripe signature is what proves the request is genuine, so an
// unverifiable body is rejected before anything is read out of it.
export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = (await getStripeClient()).webhooks.constructEvent(rawBody, signature, await getStripeWebhookSecret());
  } catch (error) {
    console.error('[stripe-webhook] Signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (CREDITING_EVENTS.has(event.type)) {
      await creditCheckoutSession(event.data.object as Stripe.Checkout.Session);
    } else {
      console.log('[stripe-webhook] Ignoring event type', event.type);
    }
  } catch (error) {
    // A 500 makes Stripe retry the delivery, which is what we want: granting
    // credits is idempotent, so a retry is always safe and never double-pays.
    console.error('[stripe-webhook] Failed to handle event', event.id, event.type, error);
    return NextResponse.json({ error: 'Failed to process webhook event' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
