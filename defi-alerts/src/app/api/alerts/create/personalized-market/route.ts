import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType } from '@prisma/client';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import {
  getUser,
  mapChainsToPrismaConnect,
  mapMarketsByAddressToPrismaConnect,
  validateArrayFields,
  validateConditions,
  validateDeliveryChannels,
  validateRequiredFields,
} from '@/utils/alertUtils';

export interface CreatePersonalizedAlertPayload {
  walletAddress: string;
  category: AlertCategory;
  actionType: AlertActionType;
  selectedChains: string[];
  selectedMarkets: string[];
  compareProtocols: string[];
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

export interface PersonalizedAlertCreationResponse {
  ok: boolean;
  alertId: string;
}

async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<PersonalizedAlertCreationResponse> {
  console.log('[PersonalizedMarketAlert] Starting postHandler with user:', { username: userContext.username, spaceId: userContext.spaceId });

  const { username, spaceId } = userContext;
  const { walletAddress, category, actionType, selectedChains, selectedMarkets, compareProtocols, notificationFrequency, conditions, deliveryChannels } =
    (await request.json()) as CreatePersonalizedAlertPayload;

  // Basic validation
  if (!walletAddress) {
    throw new Error('Missing required field: walletAddress');
  }

  // Validate required fields
  validateRequiredFields({ walletAddress, category, actionType, notificationFrequency }, ['walletAddress', 'category', 'actionType', 'notificationFrequency']);

  // Validate array fields
  validateArrayFields({ selectedChains, selectedMarkets, conditions, deliveryChannels }, [
    'selectedChains',
    'selectedMarkets',
    'conditions',
    'deliveryChannels',
  ]);

  // Validate conditions
  validateConditions(conditions);

  // Validate delivery channels
  validateDeliveryChannels(deliveryChannels);

  // Fetch user
  const user = await getUser(username, spaceId);

  // 1) Map chain names → { chainId }
  const chainConnect = mapChainsToPrismaConnect(selectedChains);

  // 2) Map each selectedMarkets → Asset PK via chain+symbol
  const assetConnect = mapMarketsByAddressToPrismaConnect(selectedChains, selectedMarkets);

  // 3) Create the personalized alert
  const alert = await prisma.alert.create({
    data: {
      user: { connect: { id: user.id } },
      walletAddress,
      category,
      actionType,
      // relational fields:
      selectedChains: { connect: chainConnect },
      selectedAssets: { connect: assetConnect },
      compareProtocols, // array of strings
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

  return { ok: true, alertId: alert.id };
}

export const POST = withLoggedInUser<PersonalizedAlertCreationResponse>(postHandler);
