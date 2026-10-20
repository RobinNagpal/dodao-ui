import { getAppConfigBoolean } from '@/lib/appConfig/appConfig';
import { PurchasesEnabledResponse } from '@/types/credits';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// GET /api/[spaceId]/users/credits/purchases-enabled — public: whether credits can be
// bought right now (the admin kill switch in App Settings → Payments). A plain route
// rather than a Server Action: action ids change on every build, so pages CloudFront
// cached before a deploy would call an id the new build no longer has, and an action
// fired on mount also holds up the router's action queue while it is in flight.
async function getHandler(_req: NextRequest): Promise<PurchasesEnabledResponse> {
  return { enabled: await getAppConfigBoolean('STRIPE_CREDIT_PURCHASES_ENABLED') };
}

export const GET = withErrorHandlingV2<PurchasesEnabledResponse>(getHandler);
