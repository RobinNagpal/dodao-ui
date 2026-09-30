import { prisma } from '@/prisma';
import { CreditBalanceSummaryResponse } from '@/types/credits';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

// GET /api/[spaceId]/users/credits/balance — just the balance, for the navbar.
// A single-column read, so it stays cheap enough to call on every page load
// (the full /credits route also loads history).
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CreditBalanceSummaryResponse> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userContext.userId }, select: { credits: true } });
  return { credits: user.credits };
}

export const GET = withLoggedInUser<CreditBalanceSummaryResponse>(getHandler);
