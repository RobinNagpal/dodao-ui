import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType } from '@prisma/client';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import {
  BaseAlertCondition,
  BaseDeliveryChannel,
  getUser,
  mapChainsToPrismaConnect,
  mapMarketsByAddressToPrismaConnect,
  validateArrayFields,
  validateConditions,
  validateDeliveryChannels,
  validateRequiredFields,
} from '@/utils/alertUtils';

export interface PersonalizedComparisonAlertPayload {
  walletAddress: string;
  category: AlertCategory;
  actionType: AlertActionType;
  isComparison: boolean;
  selectedChains: string[];
  selectedMarkets: string[];
  compareProtocols: string[];
  notificationFrequency: NotificationFrequency;
  conditions: Array<{
    type: ConditionType;
    value: string;
    severity: SeverityLevel;
  }>;
  deliveryChannels: Array<{
    type: DeliveryChannelType;
    email?: string;
    webhookUrl?: string;
  }>;
}

export interface PersonalizedComparisonAlertResponse {
  ok: boolean;
  alertId: string;
}

async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<PersonalizedComparisonAlertResponse> {
  console.log('[PersonalizedComparisonAlert] Starting postHandler with user:', { username: userContext.username, spaceId: userContext.spaceId });

  const { username, spaceId } = userContext;
  const {
    walletAddress,
    category,
    actionType,
    isComparison,
    selectedChains,
    selectedMarkets,
    compareProtocols,
    notificationFrequency,
    conditions,
    deliveryChannels,
  } = (await request.json()) as PersonalizedComparisonAlertPayload;

  // Basic validation
  if (!walletAddress) {
    throw new Error('Missing required field: walletAddress');
  }
  if (!isComparison) {
    throw new Error('Missing required field: isComparison must be true for comparison alerts');
  }

  // Validate required fields
  validateRequiredFields({ walletAddress, category, actionType, notificationFrequency }, ['walletAddress', 'category', 'actionType', 'notificationFrequency']);

  // Validate array fields
  validateArrayFields({ selectedChains, selectedMarkets, compareProtocols, conditions, deliveryChannels }, [
    'selectedChains',
    'selectedMarkets',
    'compareProtocols',
    'conditions',
    'deliveryChannels',
  ]);

  // Validate conditions
  validateConditions(conditions);

  // Validate delivery channels
  validateDeliveryChannels(deliveryChannels);

  // Fetch user
  const user = await getUser(username, spaceId);

  // Map chains → Prisma connect
  const chainConnect = mapChainsToPrismaConnect(selectedChains);

  // Map markets → Prisma connect using asset addresses
  const assetConnect = mapMarketsByAddressToPrismaConnect(selectedChains, selectedMarkets);

  // Create alert
  const alert = await prisma.alert.create({
    data: {
      user: { connect: { id: user.id } },
      walletAddress,
      category,
      actionType,
      isComparison: true,
      selectedChains: { connect: chainConnect },
      selectedAssets: { connect: assetConnect },
      compareProtocols,
      notificationFrequency,
      conditions: {
        create: conditions.map((c) => ({
          conditionType: c.type,
          thresholdValue: parseFloat(c.value),
          severity: c.severity,
        })),
      },
      deliveryChannels: {
        create: deliveryChannels.map((d) => ({
          channelType: d.type,
          email: d.type === 'EMAIL' ? d.email : undefined,
          webhookUrl: d.type === 'WEBHOOK' ? d.webhookUrl : undefined,
        })),
      },
    },
  });

  return { ok: true, alertId: alert.id };
}

export const POST = withLoggedInUser<PersonalizedComparisonAlertResponse>(postHandler);
