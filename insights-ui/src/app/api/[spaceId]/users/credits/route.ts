import { prisma } from '@/prisma';
import { CreditBalanceResponse } from '@/types/credits';
import { loadCreditHistory, parseHistoryLimit } from '@/utils/credits/credit-history';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

// GET /api/[spaceId]/users/credits?limit=50 — the logged-in user's balance and
// their most recent `limit` history rows ("Load more" raises the limit).
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreditBalanceResponse> {
  const { userId } = userContext;
  const limit = parseHistoryLimit(req.nextUrl.searchParams.get('limit'));

  const [user, history] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { credits: true } }),
    loadCreditHistory(userId, limit),
  ]);

  return {
    credits: user.credits,
    reservedCredits: history.reservedCredits,
    transactions: history.transactions,
    hasMore: history.hasMore,
  };
}

export const GET = withLoggedInUser<CreditBalanceResponse>(getHandler);
