import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType, Alert } from '@prisma/client';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import {
  BaseAlertCondition,
  BaseDeliveryChannel,
  getUser,
  mapChainsToPrismaConnect,
  mapMarketsToPrismaConnect,
  validateArrayFields,
  validateConditions,
  validateDeliveryChannels,
  validateRequiredFields,
} from '@/utils/alertUtils';

export interface CompareCompoundAlertPayload {
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

export interface CompareCompoundAlertResponse {
  ok: boolean;
  alertId: string;
}

async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CompareCompoundAlertResponse> {
  console.log('[CompareCompoundAlert] Starting postHandler with user:', { username: userContext.username, spaceId: userContext.spaceId });

  const { username, spaceId } = userContext;
  const { category, actionType, isComparison, selectedChains, selectedMarkets, compareProtocols, notificationFrequency, conditions, deliveryChannels } =
    (await request.json()) as CompareCompoundAlertPayload;

  console.log('[CompareCompoundAlert] Request payload:', {
    username,
    spaceId,
    category,
    actionType,
    isComparison,
    selectedChains,
    selectedMarkets,
    compareProtocols,
    notificationFrequency,
    conditionsCount: conditions.length,
    deliveryChannelsCount: deliveryChannels.length,
  });

  // Basic validation
  console.log('[CompareCompoundAlert] Performing basic validation');
  if (!isComparison) {
    console.log('[CompareCompoundAlert] Validation error: isComparison must be true');
    throw new Error('Missing required field: isComparison must be true for comparison alerts');
  }

  // Validate required fields
  console.log('[CompareCompoundAlert] Validating required fields');
  validateRequiredFields({ category, actionType, notificationFrequency }, ['category', 'actionType', 'notificationFrequency']);

  // Validate array fields
  console.log('[CompareCompoundAlert] Validating array fields');
  validateArrayFields({ selectedChains, selectedMarkets, compareProtocols, conditions, deliveryChannels }, [
    'selectedChains',
    'selectedMarkets',
    'compareProtocols',
    'conditions',
    'deliveryChannels',
  ]);
  console.log('[CompareCompoundAlert] Basic validation passed');

  // Validate conditions
  console.log('[CompareCompoundAlert] Validating conditions');
  validateConditions(conditions);
  console.log('[CompareCompoundAlert] All conditions validated successfully');

  // Validate delivery channels
  console.log('[CompareCompoundAlert] Validating delivery channels');
  validateDeliveryChannels(deliveryChannels);
  console.log('[CompareCompoundAlert] All delivery channels validated successfully');

  // Fetch user
  const user = await getUser(username, spaceId);

  // Map chains → Prisma connect
  const chainConnect = mapChainsToPrismaConnect(selectedChains);

  // Map assets → Prisma connect
  const assetConnect = mapMarketsToPrismaConnect(selectedChains, selectedMarkets);

  // Create alert
  console.log('[CompareCompoundAlert] Creating alert in database');
  try {
    const alert = await prisma.alert.create({
      data: {
        user: { connect: { id: user.id } },
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

    console.log('[CompareCompoundAlert] Alert created successfully', { alertId: alert.id });
    return { ok: true, alertId: alert.id };
  } catch (error) {
    console.error('[CompareCompoundAlert] Error creating alert in database', error);
    throw error;
  }
}

export const POST = withLoggedInUser<CompareCompoundAlertResponse>(postHandler);
