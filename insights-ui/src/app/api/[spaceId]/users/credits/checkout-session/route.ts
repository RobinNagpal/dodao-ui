import { prisma } from '@/prisma';
import { CREDIT_CURRENCY, CREDITS_PURCHASED_QUERY_PARAM, CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, getCreditPack } from '@/types/credits';
import { getStripeClient } from '@/utils/credits/stripe-client';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

/**
 * `returnPath` comes from the browser, so it is only ever used as a path on
 * this origin. Anything absolute, protocol-relative (`//evil.com`) or otherwise
 * unparseable falls back to the credits page — a checkout flow must not become
 * an open redirect.
 */
function toSameOriginUrl(origin: string, returnPath: string | undefined): string {
  const fallback = `${origin}/credits`;
  if (!returnPath || !returnPath.startsWith('/') || returnPath.startsWith('//')) {
    return fallback;
  }
  try {
    const url = new URL(returnPath, origin);
    return url.origin === origin ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function withQueryParam(url: string, key: string, value: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set(key, value);
  return parsed.toString();
}

// POST /api/[spaceId]/users/credits/checkout-session — starts a Stripe Checkout
// Session for one credit pack and hands back the URL to redirect the user to.
// Credits are only granted by the webhook, never here: the redirect back can be
// lost or forged, the signed webhook cannot.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreateCheckoutSessionResponse> {
  const { userId } = userContext;
  const body = (await req.json()) as CreateCheckoutSessionRequest;

  const pack = getCreditPack(body.packKey);
  if (!pack) {
    throw new Error(`Unknown credit pack: ${body.packKey}`);
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, spaceId: true, stripeCustomerId: true },
  });

  const stripe = getStripeClient();

  // Reusing one Stripe customer per user keeps their receipts and saved cards
  // together, which makes the second purchase a two-click flow.
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { userId: user.id, spaceId: user.spaceId },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId } });
  }

  const returnUrl = toSameOriginUrl(req.nextUrl.origin, body.returnPath);

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
    // Read back by the webhook to decide who gets how many credits. Never trust
    // the amount from the client — both are re-derived from the pack here.
    metadata: {
      userId: user.id,
      spaceId: user.spaceId,
      packKey: pack.key,
      credits: String(pack.credits),
    },
    success_url: withQueryParam(returnUrl, CREDITS_PURCHASED_QUERY_PARAM, String(pack.credits)),
    cancel_url: returnUrl,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL');
  }

  return { checkoutUrl: session.url };
}

export const POST = withLoggedInUser<CreateCheckoutSessionResponse>(postHandler);
