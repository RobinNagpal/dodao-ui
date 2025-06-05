import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Alert, AlertCondition, Asset, Chain, DeliveryChannel } from '@prisma/client';
import { NextRequest } from 'next/server';

// Define the return type for the alerts query
export type AlertResponse = Alert & {
  conditions: AlertCondition[];
  deliveryChannels: DeliveryChannel[];
  selectedChains: Chain[];
  selectedAssets: Asset[];
};

async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<AlertResponse[]> {
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

export const GET = withLoggedInUser<AlertResponse[]>(getHandler);
