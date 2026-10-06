import { getAppConfigBoolean } from '@/lib/appConfig/appConfig';
import { prisma } from '@/prisma';
import { CREDIT_CURRENCY, CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, getCreditPack } from '@/types/credits';
import { buildCheckoutReturnUrls, getCheckoutReturnOrigin } from '@/utils/credits/checkout-urls';
import { getStripeClient } from '@/utils/credits/stripe-client';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { createHash } from 'crypto';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

/** Shown after the account's statement descriptor prefix on card statements. */
const STATEMENT_DESCRIPTOR_SUFFIX = 'KOALAGAINS';

/** Top-of-page branding on the hosted Checkout page. No `icon`: we have no square asset. */
const CHECKOUT_BRANDING: Stripe.Checkout.SessionCreateParams.BrandingSettings = {
  display_name: 'KoalaGains',
  logo: { type: 'url', url: 'https://koalagains.com/koalagain_logo.png' },
  button_color: '#384aff',
  border_style: 'rounded',
};

/**
 * Idempotency key for creating this user's customer. Stripe rejects a key
 * reused with different parameters within 24h (`idempotency_error`), so the
 * key carries a hash of the parameters: an email changed since the last
 * attempt gets a fresh key instead of a failed checkout, while concurrent
 * checkouts (same parameters) still share one key and so one customer.
 */
function customerIdempotencyKey(params: Stripe.CustomerCreateParams, userId: string, replacesCustomerId: string | null): string {
  const paramsHash = createHash('sha256').update(JSON.stringify(params)).digest('hex').slice(0, 16);
  // A replacement needs its own key: the original one would hand back the missing customer for 24h.
  const base = replacesCustomerId ? `credit-customer-${userId}-replaces-${replacesCustomerId}` : `credit-customer-${userId}`;
  return `${base}-${paramsHash}`;
}

/**
 * The Stripe customer this user's purchases go to. One per user keeps their
 * receipts and saved cards together, and it holds the credit balance, so a user
 * must never end up with two: the idempotency keys make concurrent checkouts
 * (double click, two tabs) get the same customer instead of each creating one.
 *
 * A stored customer Stripe doesn't know (a test-mode id against the live key, or
 * one deleted in the dashboard) is replaced — but only for a user who never
 * bought: after a purchase that customer holds their credits, and silently
 * swapping it would hide them.
 */
async function getOrCreateStripeCustomer(
  stripe: Stripe,
  user: { id: string; email: string | null; spaceId: string; stripeCustomerId: string | null; firstPurchaseAt: Date | null }
): Promise<string> {
  const storedId = user.stripeCustomerId;
  if (storedId) {
    let missing = false;
    try {
      const customer = await stripe.customers.retrieve(storedId);
      missing = !!customer.deleted;
    } catch (error) {
      if ((error as { code?: string })?.code !== 'resource_missing') {
        throw error;
      }
      missing = true;
    }
    if (!missing) {
      return storedId;
    }
    if (user.firstPurchaseAt) {
      await logError("[checkout-session] MANUAL REPAIR NEEDED: the user's Stripe customer no longer exists in Stripe but they have purchased before", {
        userId: user.id,
        stripeCustomerId: storedId,
      });
      throw new Error('We could not open checkout for your account. Please contact support.');
    }
    console.warn('[checkout-session] Stored Stripe customer does not exist in Stripe; creating a new one for a user who never bought', {
      userId: user.id,
      stripeCustomerId: storedId,
    });
  }

  const params: Stripe.CustomerCreateParams = {
    email: user.email ?? undefined,
    metadata: { userId: user.id, spaceId: user.spaceId },
  };
  const customer = await stripe.customers.create(params, { idempotencyKey: customerIdempotencyKey(params, user.id, storedId) });
  // Only replace what we read, so two concurrent checkouts can't overwrite each other's link.
  const linked = await prisma.user.updateMany({ where: { id: user.id, stripeCustomerId: storedId }, data: { stripeCustomerId: customer.id } });
  if (linked.count === 0) {
    // Another request linked a customer first; use theirs so the user keeps exactly one.
    const current = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { stripeCustomerId: true } });
    return current.stripeCustomerId ?? customer.id;
  }
  return customer.id;
}

// POST /api/[spaceId]/users/credits/checkout-session — starts a Stripe Checkout
// Session for one credit pack and hands back the URL to redirect the user to.
// Credits are granted by the webhook or by confirm-checkout on return — both
// verify the session with Stripe; nothing the browser sends is trusted.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreateCheckoutSessionResponse> {
  // Admin kill switch (App Settings → Payments) for when Stripe is having
  // issues. It only blocks buying; spending isn't gated here, but spending also
  // reads and charges the Stripe ledger, so it can fail while Stripe is down.
  if (!(await getAppConfigBoolean('STRIPE_CREDIT_PURCHASES_ENABLED'))) {
    throw new Error('Buying credits is temporarily unavailable. Please try again later.');
  }

  const { userId } = userContext;
  const body = (await req.json()) as CreateCheckoutSessionRequest;

  const pack = getCreditPack(body.packKey);
  if (!pack) {
    throw new Error(`Unknown credit pack: ${body.packKey}`);
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, spaceId: true, stripeCustomerId: true, firstPurchaseAt: true },
  });

  const stripe = await getStripeClient();
  const stripeCustomerId = await getOrCreateStripeCustomer(stripe, user);

  // Built from the public origin, never req.nextUrl.origin (the container's internal host in production).
  const { successUrl, cancelUrl } = buildCheckoutReturnUrls(getCheckoutReturnOrigin(req.nextUrl.origin), body.returnPath, pack.credits);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: stripeCustomerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CREDIT_CURRENCY,
          unit_amount: pack.amountInCents,
          product_data: {
            name: `${pack.credits} KoalaGains report ${pack.credits === 1 ? 'credit' : 'credits'}`,
            description: 'One credit generates one full report. Credits never expire.',
          },
        },
      },
    ],
    // Charge in USD only: adaptive pricing would show and charge a converted
    // local-currency amount, breaking "1 credit = $1".
    adaptive_pricing: { enabled: false },
    branding_settings: CHECKOUT_BRANDING,
    payment_intent_data: {
      // Card statements read "<account prefix>* KOALAGAINS" (≤ 22 chars, has letters, none of <>\'"*).
      statement_descriptor_suffix: STATEMENT_DESCRIPTOR_SUFFIX,
    },
    // Read back by the webhook to decide who gets how many credits. Never trust
    // the amount from the client — both are re-derived from the pack here.
    metadata: {
      userId: user.id,
      spaceId: user.spaceId,
      packKey: pack.key,
      credits: String(pack.credits),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return { checkoutUrl: session.url };
}

export const POST = withLoggedInUser<CreateCheckoutSessionResponse>(postHandler);
