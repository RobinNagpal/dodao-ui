import { prisma } from '@/prisma';
import { AlertWithAllDetails } from '@/types/alerts';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<AlertWithAllDetails[]> {
  const { userId } = userContext;

  const alerts = await prisma.alert.findMany({
    where: {
      userId,
      archive: false,
    },
    include: {
      conditions: true,
      deliveryChannels: true,
      selectedChains: true,
      selectedAssets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return alerts;
}

export const GET = withLoggedInUser<AlertWithAllDetails[]>(getHandler);
