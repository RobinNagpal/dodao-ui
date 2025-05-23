import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Alert } from '@prisma/client';

// Define the return type for the alerts query
export type AlertsResponse = (Alert & {
  conditions: any[];
  deliveryChannels: any[];
  selectedChains: any[];
  selectedAssets: any[];
})[];

async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<AlertsResponse> {
  const { userId } = userContext;

  const alerts = await prisma.alert.findMany({
    where: { userId },
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

export const GET = withLoggedInUser<AlertsResponse>(getHandler);
