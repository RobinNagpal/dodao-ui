import { prisma } from '@/prisma';
import { CreditReceiptResponse } from '@/types/credits';
import { getStripeClient } from '@/utils/credits/stripe-client';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

// GET /api/[spaceId]/users/credits/receipt?transactionId=… — the Stripe-hosted
// receipt for one of the user's purchases. `transactionId` is the Stripe balance
// transaction shown in the credit history. We only store the payment intent id,
// so the receipt URL is looked up on demand instead of being kept in the DB.
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreditReceiptResponse> {
  const transactionId = req.nextUrl.searchParams.get('transactionId');
  if (!transactionId) {
    throw new Error('transactionId is required');
  }

  // Scoped to the logged-in user, so nobody can open someone else's receipt.
  const purchase = await prisma.stripeCreditPurchase.findFirstOrThrow({
    where: { stripeCreditTxnId: transactionId, userId: userContext.userId },
    select: { stripePaymentIntentId: true },
  });
  if (!purchase.stripePaymentIntentId) {
    throw new Error('No receipt is available for this purchase');
  }

  const paymentIntent = await (await getStripeClient()).paymentIntents.retrieve(purchase.stripePaymentIntentId, { expand: ['latest_charge'] });
  const receiptUrl = (paymentIntent.latest_charge as Stripe.Charge | null)?.receipt_url;
  if (!receiptUrl) {
    throw new Error('Stripe has no receipt for this purchase yet');
  }

  return { receiptUrl };
}

export const GET = withLoggedInUser<CreditReceiptResponse>(getHandler);
