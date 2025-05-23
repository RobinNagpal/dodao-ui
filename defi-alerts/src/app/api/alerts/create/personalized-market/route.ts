import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType } from '@prisma/client';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';

import { CHAINS, MARKETS } from '@/shared/web3/config';

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
  if (!category) {
    throw new Error('Missing required field: category');
  }
  if (!actionType) {
    throw new Error('Missing required field: actionType');
  }
  if (!Array.isArray(selectedChains) || selectedChains.length === 0) {
    throw new Error('Missing required field: selectedChains must be a non-empty array');
  }
  if (!Array.isArray(selectedMarkets) || selectedMarkets.length === 0) {
    throw new Error('Missing required field: selectedMarkets must be a non-empty array');
  }
  if (!notificationFrequency) {
    throw new Error('Missing required field: notificationFrequency');
  }
  if (!Array.isArray(conditions) || conditions.length === 0) {
    throw new Error('Missing required field: conditions must be a non-empty array');
  }
  if (!Array.isArray(deliveryChannels) || deliveryChannels.length === 0) {
    throw new Error('Missing required field: deliveryChannels must be a non-empty array');
  }

  // Validate conditions
  for (const c of conditions) {
    if (c.type === ConditionType.APR_OUTSIDE_RANGE) {
      // require both min & max
      if (!c.min || !c.max) {
        throw new Error('Both min and max thresholds are required for range conditions.');
      }
      if (isNaN(Number(c.min)) || isNaN(Number(c.max))) {
        throw new Error('Min and max thresholds must be valid numbers.');
      }
    } else {
      // single‐value conditions
      if (!c.value) {
        throw new Error('A threshold value is required for all other condition types.');
      }
      if (isNaN(Number(c.value))) {
        throw new Error('Threshold values must be valid numbers.');
      }
    }
  }

  // Validate delivery channels
  for (const d of deliveryChannels) {
    if (d.type === DeliveryChannelType.EMAIL) {
      if (!d.email) {
        throw new Error('An email address is required for Email channels.');
      }
      // simple regex check
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(d.email)) {
        throw new Error(`Invalid email address: ${d.email}`);
      }
    } else if (d.type === DeliveryChannelType.WEBHOOK) {
      if (!d.webhookUrl) {
        throw new Error('A webhook URL is required for Webhook channels.');
      }
      try {
        new URL(d.webhookUrl);
      } catch {
        throw new Error(`Invalid webhook URL: ${d.webhookUrl}`);
      }
    }
  }

  // Fetch user
  console.log('[PersonalizedMarketAlert] Looking up user in database', { username, spaceId });
  const user = await prisma.user.findUnique({ where: { username_spaceId: { username, spaceId } } });
  if (!user) {
    console.log('[PersonalizedMarketAlert] User not found in database', { username, spaceId });
    throw new Error('User not found');
  }
  console.log('[PersonalizedMarketAlert] User found successfully', { userId: user.id });

  // 1) Map chain names → { chainId }
  const chainConnect = selectedChains.map((chainName) => {
    const cfg = CHAINS.find((c) => c.name === chainName);
    if (!cfg) throw new Error(`Unsupported chain: ${chainName}`);
    return { chainId: cfg.chainId };
  });

  // 2) Map each selectedMarkets → Asset PK via chain+symbol
  const assetConnect = selectedChains.flatMap((chainName) => {
    const cfg = CHAINS.find((c) => c.name === chainName)!;
    return selectedMarkets
      .map((uiSymbol) => {
        // "ETH" on UI → symbol "WETH"
        const symbol = uiSymbol === 'ETH' ? 'WETH' : uiSymbol;
        const m = MARKETS.find((m) => m.chainId === cfg.chainId && m.symbol === symbol);
        if (!m) {
          return null;
        }
        // composite PK is `<chainId>_<baseAssetAddress>`
        return {
          chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}`,
        };
      })
      .filter((x): x is { chainId_address: string } => x !== null);
  });

  if (assetConnect.length === 0) {
    throw new Error('No valid markets found for your chain+asset selections. Please choose a supported combination.');
  }

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
