import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Alert, AlertNotification, SentNotification } from '@prisma/client';
import { NextRequest } from 'next/server';

// Define the return type for the alert notifications query
export type AlertNotificationResponse = AlertNotification & {
  alert: Alert;
  SentNotification: SentNotification | null;
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
      alert: true,
      SentNotification: true,
    },
    orderBy: {
      SentNotification: {
        sentAt: 'desc',
      },
    },
  });

  return alertNotifications;
}

export const GET = withLoggedInUser<AlertNotificationResponse[]>(getHandler);
