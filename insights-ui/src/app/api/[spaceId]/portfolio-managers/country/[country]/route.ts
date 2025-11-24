import { prisma } from '@/prisma';
import { PortfolioManagerProfile } from '@prisma/client';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface PortfolioManagerProfileWithUser extends PortfolioManagerProfile {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
  };
  _count: {
    portfolios: number;
  };
}

// GET /api/[spaceId]/portfolio-managers/country/[country] - Get portfolio managers by country
async function getHandler(req: NextRequest, { params }: { params: Promise<{ country: string }> }): Promise<{ profiles: PortfolioManagerProfileWithUser[] }> {
  const { country } = await params;
  const { searchParams } = new URL(req.url);
  const managerType = searchParams.get('managerType');

  const profiles = await prisma.portfolioManagerProfile.findMany({
    where: {
      country: country,
      spaceId: KoalaGainsSpaceId,
      isPublic: true,
      ...(managerType && { managerType }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      },
      _count: {
        select: {
          portfolios: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { profiles };
}

export const GET = withErrorHandlingV2<{ profiles: PortfolioManagerProfileWithUser[] }>(getHandler);
