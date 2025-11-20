import { prisma } from '@/prisma';
import { Portfolio } from '@/types/portfolio';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

// GET /api/[spaceId]/portfolios/[id] - Get a specific portfolio
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<{ portfolio: Portfolio }> {
  const { userId } = userContext;
  const { id } = params;

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioManagerProfile: true,
      portfolioTickers: {
        include: {
          ticker: true,
          tags: true,
          lists: true,
        },
      },
    },
  });

  // Verify ownership
  if (!portfolio || portfolio.portfolioManagerProfile.userId !== userId) {
    throw new Error('Portfolio not found or access denied');
  }

  return { portfolio };
}

export const GET = withLoggedInUser<{ portfolio: Portfolio }>(getHandler);
