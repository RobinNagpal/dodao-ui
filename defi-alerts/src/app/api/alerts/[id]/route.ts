import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Alert } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Alert> {
  const { id } = await params;

  const alert = await prisma.alert.findUniqueOrThrow({
    where: { id },
    include: {
      conditions: true,
      deliveryChannels: true,
      selectedChains: true,
      selectedAssets: true,
      AlertNotification: {
        include: {
          SentNotification: true,
        },
      },
    },
  });

  return alert;
}

async function putHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Alert> {
  const { id } = await params;
  const {
    id: marketId,
    actionType,
    selectedChains,
    selectedAssets,
    notificationFrequency,
    conditions,
    deliveryChannels,
    walletAddress,
    status,
  } = await req.json();

  // First, delete existing related records to avoid duplicates
  await prisma.alertCondition.deleteMany({
    where: { alertId: id },
  });

  await prisma.deliveryChannel.deleteMany({
    where: { alertId: id },
  });

  // Update alert with new data
  const updatedAlert = await prisma.alert.update({
    where: { id },
    data: {
      marketId,
      actionType,
      status,
      walletAddress,
      notificationFrequency,
      selectedChains: {
        set: [], // Clear existing relations
        connect: selectedChains, // Connect new chains
      },
      selectedAssets: {
        set: [], // Clear existing relations
        connect: selectedAssets, // Connect new assets
      },
      conditions: {
        create: conditions.map((c: any) => ({
          conditionType: c.conditionType,
          thresholdValue: c.thresholdValue ? parseFloat(c.thresholdValue) : undefined,
          thresholdValueLow: c.thresholdValueLow ? parseFloat(c.thresholdValueLow) : undefined,
          thresholdValueHigh: c.thresholdValueHigh ? parseFloat(c.thresholdValueHigh) : undefined,
          severity: c.severity,
        })),
      },
      deliveryChannels: {
        create: deliveryChannels.map((d: any) => ({
          channelType: d.channelType,
          email: d.channelType === 'EMAIL' ? d.email : undefined,
          webhookUrl: d.channelType === 'WEBHOOK' ? d.webhookUrl : undefined,
        })),
      },
    },
    include: {
      conditions: true,
      deliveryChannels: true,
      selectedChains: true,
      selectedAssets: true,
    },
  });

  return updatedAlert;
}

async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Alert> {
  const { id } = await params;

  // First, delete related records to ensure clean deletion
  // Delete alert conditions
  await prisma.alertCondition.deleteMany({
    where: { alertId: id },
  });

  // Delete delivery channels
  await prisma.deliveryChannel.deleteMany({
    where: { alertId: id },
  });

  // Delete alert notifications and sent notifications
  const alertNotifications = await prisma.alertNotification.findMany({
    where: { alertId: id },
    select: { id: true },
  });

  if (alertNotifications.length > 0) {
    const notificationIds = alertNotifications.map((notification) => notification.id);

    // Delete sent notifications related to the alert notifications
    await prisma.sentNotification.deleteMany({
      where: { alertNotificationId: { in: notificationIds } },
    });

    // Delete alert notifications
    await prisma.alertNotification.deleteMany({
      where: { id: { in: notificationIds } },
    });
  }

  // Finally, delete the alert
  const deletedAlert = await prisma.alert.delete({
    where: { id },
    include: {
      conditions: true,
      deliveryChannels: true,
      selectedChains: true,
      selectedAssets: true,
    },
  });

  return deletedAlert;
}

export const GET = withErrorHandlingV2<Alert>(getHandler);
export const PUT = withErrorHandlingV2<Alert>(putHandler);
export const DELETE = withErrorHandlingV2<Alert>(deleteHandler);
