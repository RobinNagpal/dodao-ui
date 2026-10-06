import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import { creditCheckoutSession, restoreClosedDispute, reverseDisputedCharge, reverseRefundedCharge } from '@/utils/credits/credit-purchase';
import { getStripeClient, getStripeWebhookSecret } from '@/utils/credits/stripe-client';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Signature verification needs the exact bytes Stripe signed, so this route
// reads the raw body itself and must run on Node, not the edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Events that mean "the money for this checkout session has arrived". */
const CREDITING_EVENTS = new Set<string>(['checkout.session.completed', 'checkout.session.async_payment_succeeded']);

/** True for a live-mode secret / restricted key (`sk_live_…`, `rk_live_…`). */
async function isLiveModeKey(): Promise<boolean> {
  const secretKey = (await getAppConfigValue('STRIPE_SECRET_KEY'))?.trim() ?? '';
  return /^(sk|rk)_live_/.test(secretKey);
}

/** Event API versions already warned about, so a mismatch logs once per process rather than per delivery. */
const warnedApiVersions = new Set<string>();

/**
 * The endpoint renders events in the account's default API version, which can
 * differ from the one stripe-node is pinned to (and its types describe). The
 * fields we read are stable across versions, so a mismatch is only worth a
 * heads-up — pin the endpoint's version to `Stripe.API_VERSION` to silence it.
 */
function warnOnApiVersionMismatch(event: Stripe.Event): void {
  const eventVersion = event.api_version ?? 'unknown';
  if (eventVersion === Stripe.API_VERSION || warnedApiVersions.has(eventVersion)) {
    return;
  }
  warnedApiVersions.add(eventVersion);
  console.warn('[stripe-webhook] Event API version differs from the stripe-node pinned version', {
    eventApiVersion: eventVersion,
    pinnedApiVersion: Stripe.API_VERSION,
    eventId: event.id,
  });
}

/** Runs the handler for one verified event. Throwing makes the route answer 500 so Stripe retries. */
async function handleEvent(event: Stripe.Event): Promise<void> {
  if (CREDITING_EVENTS.has(event.type)) {
    // The user no longer existing is logged and acknowledged (`unknown_user`): retrying can't fix it.
    await creditCheckoutSession(event.data.object as Stripe.Checkout.Session, 'webhook');
  } else if (event.type === 'charge.refunded') {
    await reverseRefundedCharge(event.data.object as Stripe.Charge);
  } else if (event.type === 'charge.dispute.created') {
    await reverseDisputedCharge(event.data.object as Stripe.Dispute);
  } else if (event.type === 'charge.dispute.closed') {
    // Won / inquiry closed / prevented give the dispute debit back; lost keeps it.
    await restoreClosedDispute(event.data.object as Stripe.Dispute);
  } else {
    console.log('[stripe-webhook] Ignoring event type', event.type);
  }
}

// POST /api/stripe/webhook — Stripe's payment notifications. Unauthenticated by
// design; the Stripe signature is what proves the request is genuine, so an
// unverifiable body is rejected before anything is read out of it.
//
// Anything that stops a purchase from being credited (or a refund from being
// reversed) answers 4xx/5xx so Stripe keeps retrying, and goes through logError
// so it alerts on Discord as well as landing in the logs.
export async function POST(req: NextRequest): Promise<NextResponse> {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    // Not from Stripe (scanners etc.): one warn line, no alert.
    console.warn('[stripe-webhook] Request without a stripe-signature header rejected');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let stripe: Stripe;
  let webhookSecret: string;
  let liveModeKey: boolean;
  try {
    [stripe, webhookSecret, liveModeKey] = await Promise.all([getStripeClient(), getStripeWebhookSecret(), isLiveModeKey()]);
  } catch (error) {
    await logError('[stripe-webhook] Payments are not configured; webhook cannot be processed (Stripe will retry)', {}, error instanceof Error ? error : null);
    return NextResponse.json({ error: 'Payments are not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    // Either a forged request or a STRIPE_WEBHOOK_SECRET that doesn't match the endpoint — the latter blocks every purchase.
    await logError('[stripe-webhook] Signature verification failed', {}, error instanceof Error ? error : null);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // A test-mode event against the live key (or vice versa) means the endpoint is wired to the wrong
  // Stripe account mode; its ids would not resolve here, so never act on it.
  if (event.livemode !== liveModeKey) {
    await logError('[stripe-webhook] Event mode does not match the configured Stripe key; rejected', {
      eventId: event.id,
      eventType: event.type,
      eventLivemode: event.livemode,
      keyLivemode: liveModeKey,
    });
    return NextResponse.json({ error: 'Event mode does not match the configured Stripe key' }, { status: 400 });
  }

  warnOnApiVersionMismatch(event);

  try {
    await handleEvent(event);
  } catch (error) {
    // A 500 makes Stripe retry the delivery, which is what we want: granting and
    // reversing credits are idempotent, so a retry is always safe.
    await logError(
      '[stripe-webhook] Failed to handle event (Stripe will retry)',
      { eventId: event.id, eventType: event.type },
      error instanceof Error ? error : null
    );
    return NextResponse.json({ error: 'Failed to process webhook event' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
