import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import Stripe from 'stripe';

// Rebuilt when the App Setting changes (e.g. a key rotated from the admin screen).
let cachedClient: { secretKey: string; client: Stripe } | null = null;

const STRIPE_TIMEOUT_MS = 20_000;
const STRIPE_MAX_NETWORK_RETRIES = 1;

/**
 * Stripe keys are App Settings (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET, both secrets: SSM
 * SecureString → env var → never a committed default). Everything credit-related degrades to a
 * clear "payments are not configured" error instead of a 500 with a stack trace.
 */
export async function getStripeClient(): Promise<Stripe> {
  const secretKey = (await getAppConfigValue('STRIPE_SECRET_KEY'))?.trim();
  if (!secretKey) {
    throw new Error('Payments are not configured: the STRIPE_SECRET_KEY App Setting is missing');
  }

  // No apiVersion override — stripe-node pins the version it was built against,
  // which is what its own types describe.
  if (cachedClient?.secretKey !== secretKey) {
    const client = new Stripe(secretKey, {
      // The library default is 80s, long enough to hang a page or a settle. A
      // retry reuses the request's idempotency key (stripe-node adds one to
      // every POST), so it can never apply a balance change twice.
      timeout: STRIPE_TIMEOUT_MS,
      maxNetworkRetries: STRIPE_MAX_NETWORK_RETRIES,
    });
    cachedClient = { secretKey, client };
  }
  return cachedClient.client;
}

export async function getStripeWebhookSecret(): Promise<string> {
  const webhookSecret = (await getAppConfigValue('STRIPE_WEBHOOK_SECRET'))?.trim();
  if (!webhookSecret) {
    throw new Error('Payments are not configured: the STRIPE_WEBHOOK_SECRET App Setting is missing');
  }
  return webhookSecret;
}
