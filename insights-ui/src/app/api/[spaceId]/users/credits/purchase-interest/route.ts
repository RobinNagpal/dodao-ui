import { getAppConfigBoolean } from '@/lib/appConfig/appConfig';
import { prisma } from '@/prisma';
import { CreditPurchaseInterestSource, getCreditPack, RecordCreditPurchaseInterestRequest, RecordCreditPurchaseInterestResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { badRequestError } from '@dodao/web-core/api/errors/badRequestError';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

const SOURCES: ReadonlyArray<CreditPurchaseInterestSource> = ['credits-page', 'regenerate-modal'];
const MAX_PAGE_PATH_LENGTH = 500;
const ANONYMOUS_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
/** Clicks kept per IP per hour; extra clicks (bots, someone hammering the button) are dropped silently. */
const MAX_CLICKS_PER_IP_PER_HOUR = 20;

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    return (await getDecodedJwtFromContext(req))?.userId || null;
  } catch {
    // An expired or invalid token is treated like a logged-out visitor.
    return null;
  }
}

function getIpHash(req: NextRequest): string | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip')?.trim();
  // Salted so the stored hash can't be matched back to an IP by hashing every address.
  return ip
    ? createHash('sha256')
        .update(`${ip}${process.env.DODAO_AUTH_SECRET ?? ''}`)
        .digest('hex')
    : null;
}

function getCountry(req: NextRequest): string | null {
  const country = (req.headers.get('x-vercel-ip-country') || req.headers.get('cloudfront-viewer-country') || req.cookies.get('country')?.value || '')
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : null;
}

// POST /api/[spaceId]/users/credits/purchase-interest — records a "Buy" click made
// while buying is switched off (App Settings → Payments), so admins can see the
// demand they turned away. Open to logged-out visitors, who are identified by a
// random id kept in their browser. A click while buying is on is not interest; it is ignored.
async function postHandler(req: NextRequest): Promise<RecordCreditPurchaseInterestResponse> {
  const body = (await req.json()) as RecordCreditPurchaseInterestRequest;

  const pack = getCreditPack(body.packKey);
  if (!pack) {
    throw badRequestError(`Unknown credit pack: ${body.packKey}`);
  }
  if (!SOURCES.includes(body.source)) {
    throw badRequestError(`Unknown source: ${body.source}`);
  }

  const userId = await getUserId(req);
  const anonymousId = typeof body.anonymousId === 'string' && ANONYMOUS_ID_PATTERN.test(body.anonymousId) ? body.anonymousId : null;
  if (!userId && !anonymousId) {
    throw badRequestError('Missing visitor id');
  }

  if (await getAppConfigBoolean('STRIPE_CREDIT_PURCHASES_ENABLED')) {
    return { recorded: false };
  }

  const ipHash = getIpHash(req);
  if (ipHash) {
    const recentFromIp = await prisma.creditPurchaseInterest.count({
      where: { ipHash, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    // Still report "recorded" so the visitor sees the normal thank-you message.
    if (recentFromIp >= MAX_CLICKS_PER_IP_PER_HOUR) {
      return { recorded: true };
    }
  }

  // This browser clicked before while logged out: those clicks belong to this user now.
  if (userId && anonymousId) {
    await prisma.creditPurchaseInterest.updateMany({ where: { anonymousId, userId: null }, data: { userId } });
  }

  await prisma.creditPurchaseInterest.create({
    data: {
      userId,
      anonymousId,
      ipHash,
      country: getCountry(req),
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

export const POST = withErrorHandlingV2<RecordCreditPurchaseInterestResponse>(postHandler);
