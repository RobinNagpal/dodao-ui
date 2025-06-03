import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Alert, AlertCondition, AlertNotification, Asset, Chain, DeliveryChannel, SentNotification } from '@prisma/client';
import { NextRequest } from 'next/server';

// Define the return type for the alert notifications query
export type AlertNotificationResponse = AlertNotification & {
  alert: Alert & {
    conditions: AlertCondition[];
    deliveryChannels: DeliveryChannel[];
    selectedChains: Chain[];
    selectedAssets: Asset[];
  };
  SentNotification: SentNotification | null;
  triggeredConditions: AlertCondition[];
};

async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<AlertNotificationResponse[]> {
  const { userId } = userContext;

  // Get all alert notifications for the user's alerts
  const alertNotifications = await prisma.alertNotification.findMany({
    where: {
      alert: {
        userId: userId,
      },
    },
    include: {
      alert: {
        include: {
          selectedChains: true,
          selectedAssets: true,
          conditions: true,
          deliveryChannels: true,
        },
      },
      SentNotification: true,
    },
    orderBy: {
      SentNotification: {
        sentAt: 'desc',
      },
    },
  });

  // Add triggeredConditions to each notification
  const notificationsWithTriggeredConditions = alertNotifications.map((notification) => {
    // Filter the alert's conditions to get only those whose IDs are in the alertConditionIds array
    const triggeredConditions = notification.alert.conditions.filter((condition) => notification.alertConditionIds.includes(condition.id));

    return {
      ...notification,
      triggeredConditions,
    };
  });

  return notificationsWithTriggeredConditions;
}

export const GET = withLoggedInUser<AlertNotificationResponse[]>(getHandler);
