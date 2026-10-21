import { getAppConfigBoolean } from '@/lib/appConfig/appConfig';
import { prisma } from '@/prisma';
import { CreditPurchaseInterestSource, getCreditPack, RecordCreditPurchaseInterestRequest, RecordCreditPurchaseInterestResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

const SOURCES: ReadonlyArray<CreditPurchaseInterestSource> = ['credits-page', 'regenerate-modal'];
const MAX_PAGE_PATH_LENGTH = 500;

// POST /api/[spaceId]/users/credits/purchase-interest — records a "Buy" click made
// while buying is switched off (App Settings → Payments), so admins can see the
// demand they turned away. A click while buying is on is not interest; it is ignored.
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<RecordCreditPurchaseInterestResponse> {
  const body = (await req.json()) as RecordCreditPurchaseInterestRequest;

  const pack = getCreditPack(body.packKey);
  if (!pack) {
    throw new Error(`Unknown credit pack: ${body.packKey}`);
  }
  if (!SOURCES.includes(body.source)) {
    throw new Error(`Unknown source: ${body.source}`);
  }

  if (await getAppConfigBoolean('STRIPE_CREDIT_PURCHASES_ENABLED')) {
    return { recorded: false };
  }

  await prisma.creditPurchaseInterest.create({
    data: {
      userId: userContext.userId,
      spaceId: KoalaGainsSpaceId,
      packKey: pack.key,
      credits: pack.credits,
      amountInCents: pack.amountInCents,
      source: body.source,
      pagePath: typeof body.pagePath === 'string' && body.pagePath ? body.pagePath.slice(0, MAX_PAGE_PATH_LENGTH) : null,
    },
  });

  return { recorded: true };
}

export const POST = withLoggedInUser<RecordCreditPurchaseInterestResponse>(postHandler);
