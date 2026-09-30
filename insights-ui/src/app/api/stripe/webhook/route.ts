import { grantPurchasedCredits } from '@/utils/credits/credit-service';
import { getStripeClient, getStripeWebhookSecret } from '@/utils/credits/stripe-client';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Signature verification needs the exact bytes Stripe signed, so this route
// reads the raw body itself and must run on Node, not the edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Events that mean "the money for this checkout session has arrived". */
const CREDITING_EVENTS = new Set<string>(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

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

  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;

  const result = await grantPurchasedCredits({
    userId,
    credits,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    amountInCents: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
  });

  console.log(
    result.granted ? `[stripe-webhook] Granted ${credits} credits to ${userId}` : `[stripe-webhook] Checkout session ${session.id} was already credited`,
    `balance=${result.credits}`
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
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
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
