import Stripe from 'stripe';

let cachedClient: Stripe | null = null;

/**
 * Stripe is only reachable from server code, and only when the deployment has
 * been given keys. Everything credit-related degrades to a clear "payments are
 * not configured" error instead of a 500 with a stack trace.
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Payments are not configured: STRIPE_SECRET_KEY is missing');
  }

  // No apiVersion override — stripe-node pins the version it was built against,
  // which is what its own types describe.
  if (!cachedClient) {
    cachedClient = new Stripe(secretKey);
  }
  return cachedClient;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Payments are not configured: STRIPE_WEBHOOK_SECRET is missing');
  }
  return webhookSecret;
}
