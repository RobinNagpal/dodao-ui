import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import { AdminUserCreditHistoryResponse } from '@/types/credits';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { loadCreditHistory, parseHistoryLimit } from '@/utils/credits/credit-history';
import { NextRequest } from 'next/server';

// GET /api/[spaceId]/admin/credits/users/[userId]?limit=50 — one user's credit
// history (purchases and report generations), for the admin credits screen.
async function getHandler(
  req: NextRequest,
  userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ userId: string }> }
): Promise<AdminUserCreditHistoryResponse> {
  const { userId } = await params;
  const limit = parseHistoryLimit(req.nextUrl.searchParams.get('limit'));

  const [user, history] = await Promise.all([
    prisma.user.findFirstOrThrow({
      where: { id: userId, spaceId: KoalaGainsSpaceId },
      select: { id: true, name: true, email: true, username: true },
    }),
    loadCreditHistory(userId, limit),
  ]);

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    credits: history.credits,
    reservedCredits: history.reservedCredits,
    transactions: history.transactions,
    hasMore: history.hasMore,
    stripeUnavailable: history.stripeUnavailable,
  };
}

export const GET = withLoggedInAdmin<AdminUserCreditHistoryResponse>(getHandler);
