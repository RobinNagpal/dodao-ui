import { CreditBalanceSummaryResponse } from '@/types/credits';
import { getUserCredits } from '@/utils/credits/credit-service';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

// GET /api/[spaceId]/users/credits/balance — just the balance, for the navbar.
// No Stripe call for users who never bought, and a cached one for those who did,
// so it stays cheap enough to call on every page load.
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreditBalanceSummaryResponse> {
  const { credits } = await getUserCredits(userContext.userId);
  return { credits };
}

export const GET = withLoggedInUser<CreditBalanceSummaryResponse>(getHandler);
