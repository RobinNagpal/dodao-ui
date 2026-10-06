import { ConfirmCheckoutRequest, ConfirmCheckoutResponse } from '@/types/credits';
import { confirmCheckoutForUser, isCheckoutSessionId } from '@/utils/credits/credit-purchase';
import { getUserCredits } from '@/utils/credits/credit-service';
import { badRequestError } from '@dodao/web-core/api/errors/badRequestError';
import { notFoundError } from '@dodao/web-core/api/errors/notFoundError';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

// POST /api/[spaceId]/users/credits/confirm-checkout — called by the page Stripe
// sends the user back to, with the Checkout Session id Stripe put in the URL.
// The id itself proves nothing: the session is read back from Stripe, must be
// one of our credits sessions for THIS user, and is only granted when Stripe
// says it is paid. The grant is the webhook's own idempotent one, so whichever
// of the two arrives first credits the purchase and the other is a no-op.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<ConfirmCheckoutResponse> {
  const body = (await req.json().catch(() => null)) as Partial<ConfirmCheckoutRequest> | null;
  const sessionId = body?.sessionId;
  if (!isCheckoutSessionId(sessionId)) {
    throw badRequestError('Invalid checkout session id');
  }

  const status = await confirmCheckoutForUser(userContext.userId, sessionId);
  if (!status) {
    throw notFoundError('Checkout session not found');
  }

  const { credits } = await getUserCredits(userContext.userId);
  return { status, credits };
}

export const POST = withLoggedInUser<ConfirmCheckoutResponse>(postHandler);
