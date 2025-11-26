import { prisma } from '@/prisma';
import { PortfolioManagerProfile, User } from '@prisma/client';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { PortfolioManagerType } from 'insights-ui/src/types/portfolio-manager';

export interface PortfolioManagerProfileWithUser extends PortfolioManagerProfile {
  user: User;
  _count: {
    portfolios: number;
  };
}

// GET /api/[spaceId]/portfolio-managers/type/[type] - Get portfolio managers by type
async function getHandler(req: NextRequest, { params }: { params: Promise<{ type: string }> }): Promise<{ profiles: PortfolioManagerProfileWithUser[] }> {
  const { type } = await params;
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');

  // Validate that the type is a valid PortfolioManagerType
  if (!Object.values(PortfolioManagerType).includes(type as PortfolioManagerType)) {
    throw new Error(`Invalid portfolio manager type: ${type}`);
  }

  const profiles = await prisma.portfolioManagerProfile.findMany({
    where: {
      managerType: type as PortfolioManagerType,
      spaceId: KoalaGainsSpaceId,
      isPublic: true,
      ...(country && { country }),
    },
    include: {
      user: true,
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
