import { prisma } from '@/prisma';
import { Portfolio } from '@prisma/client';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface PortfolioWithTickers extends Portfolio {
  portfolioTickers: Array<{
    id: string;
    tickerId: string;
    allocation: number;
  }>;
}

// GET /api/[spaceId]/portfolio-managers/[id]/portfolios - Get all portfolios for a portfolio manager profile
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<{ portfolios: PortfolioWithTickers[] }> {
  const { id } = await params;

  // Verify the profile exists
  const profile = await prisma.portfolioManagerProfile.findFirstOrThrow({
    where: {
      id,
      spaceId: KoalaGainsSpaceId,
    },
  });

  const portfolios = await prisma.portfolio.findMany({
    where: {
      portfolioManagerProfileId: id,
      spaceId: KoalaGainsSpaceId,
    },
    include: {
      portfolioTickers: {
        select: {
          id: true,
          tickerId: true,
          allocation: true,
        },
        orderBy: {
          allocation: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { portfolios };
}

export const GET = withErrorHandlingV2<{ portfolios: PortfolioWithTickers[] }>(getHandler);
