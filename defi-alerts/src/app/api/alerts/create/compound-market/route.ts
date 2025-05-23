import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { AlertActionType, ConditionType, DeliveryChannelType, NotificationFrequency, SeverityLevel } from '@prisma/client';
import { NextRequest } from 'next/server';
import { BaseAlertCondition, BaseDeliveryChannel, getUser, mapChainsToPrismaConnect, mapMarketsToPrismaConnect, validateArrayFields, validateConditions, validateDeliveryChannels, validateRequiredFields } from '@/utils/alertUtils';

export interface CreateCompoundAlertPayload {
  actionType: AlertActionType;
  selectedChains: string[];
  selectedMarkets: string[];
  notificationFrequency: NotificationFrequency;
  conditions: Array<{
    type: ConditionType;
    value?: string;
    min?: string;
    max?: string;
    severity: SeverityLevel;
  }>;
  deliveryChannels: Array<{
    type: DeliveryChannelType;
    email?: string;
    webhookUrl?: string;
  }>;
}

// Define response interface for alert creation
export interface AlertCreationResponse {
  ok: boolean;
  alertId: string;
}

async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<AlertCreationResponse> {
  console.log('[CompoundMarketAlert] Starting postHandler with user:', { username: userContext.username, spaceId: userContext.spaceId });

  const { username, spaceId } = userContext;
  const { actionType, selectedChains, selectedMarkets, notificationFrequency, conditions, deliveryChannels } =
    (await request.json()) as CreateCompoundAlertPayload;

  console.log('[CompoundMarketAlert] Request payload:', {
    actionType,
    selectedChains,
    selectedMarkets,
    notificationFrequency,
    conditionsCount: conditions.length,
    deliveryChannelsCount: deliveryChannels.length,
  });

  // Validate required fields
  console.log('[CompoundMarketAlert] Validating required fields');
  validateRequiredFields(
    { actionType, notificationFrequency },
    ['actionType', 'notificationFrequency']
  );

  // Validate array fields
  console.log('[CompoundMarketAlert] Validating array fields');
  validateArrayFields(
    { selectedChains, selectedMarkets, conditions, deliveryChannels },
    ['selectedChains', 'selectedMarkets', 'conditions', 'deliveryChannels']
  );

  // Validate conditions
  console.log('[CompoundMarketAlert] Validating conditions');
  validateConditions(conditions);
  console.log('[CompoundMarketAlert] All conditions validated successfully');

  // Validate delivery channels
  console.log('[CompoundMarketAlert] Validating delivery channels');
  validateDeliveryChannels(deliveryChannels);
  console.log('[CompoundMarketAlert] All delivery channels validated successfully');

  // 1. Look up the user
  const user = await getUser(username, spaceId);

  // 2. Map chain names to prisma connect objects
  const chainConnect = mapChainsToPrismaConnect(selectedChains);

  // 3. Build asset connect objects by pairing each symbol with each selected chain
  const assetConnect = mapMarketsToPrismaConnect(selectedChains, selectedMarkets);

  // 4. Create the alert
  console.log('[CompoundMarketAlert] Creating alert in database');
  try {
    const alert = await prisma.alert.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        category: 'GENERAL',
        actionType,
        // now using relational connects:
        selectedChains: { connect: chainConnect },
        selectedAssets: { connect: assetConnect },
        compareProtocols: [],
        notificationFrequency,
        conditions: {
          create: conditions.map((c) => ({
            conditionType: c.type,
            thresholdValue: c.type !== 'APR_OUTSIDE_RANGE' && c.value ? parseFloat(c.value) : undefined,
            thresholdValueLow: c.type === 'APR_OUTSIDE_RANGE' && c.min ? parseFloat(c.min) : undefined,
            thresholdValueHigh: c.type === 'APR_OUTSIDE_RANGE' && c.max ? parseFloat(c.max) : undefined,
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

    console.log('[CompoundMarketAlert] Alert created successfully', { alertId: alert.id });
    return { ok: true, alertId: alert.id };
  } catch (error) {
    console.error('[CompoundMarketAlert] Error creating alert in database', error);
    throw error;
  }
}

export const POST = withLoggedInUser<AlertCreationResponse>(postHandler);
