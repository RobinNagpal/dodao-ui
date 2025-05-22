import { prisma } from '@/prisma';

import { CHAINS, MARKETS } from '@/shared/web3/config';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { AlertActionType, ConditionType, DeliveryChannelType, NotificationFrequency, SeverityLevel } from '@prisma/client';
import { NextRequest } from 'next/server';

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
  console.log('[CompoundMarketAlert] Validating conditions');
  for (const c of conditions) {
    if (c.type === ConditionType.APR_OUTSIDE_RANGE) {
      // require both min & max
      if (!c.min || !c.max) {
        console.log('[CompoundMarketAlert] Validation error: Missing min or max for APR_OUTSIDE_RANGE condition', { condition: c });
        throw new Error('Both min and max thresholds are required for range conditions.');
      }
      if (isNaN(Number(c.min)) || isNaN(Number(c.max))) {
        console.log('[CompoundMarketAlert] Validation error: Invalid min or max values for APR_OUTSIDE_RANGE condition', { min: c.min, max: c.max });
        throw new Error('Min and max thresholds must be valid numbers.');
      }
    } else {
      // single‐value conditions
      if (!c.value) {
        console.log('[CompoundMarketAlert] Validation error: Missing value for condition', { conditionType: c.type });
        throw new Error('A threshold value is required for all other condition types.');
      }
      if (isNaN(Number(c.value))) {
        console.log('[CompoundMarketAlert] Validation error: Invalid value for condition', { conditionType: c.type, value: c.value });
        throw new Error('Threshold values must be valid numbers.');
      }
    }
  }
  console.log('[CompoundMarketAlert] All conditions validated successfully');

  // Validate delivery channels
  console.log('[CompoundMarketAlert] Validating delivery channels');
  for (const d of deliveryChannels) {
    if (d.type === DeliveryChannelType.EMAIL) {
      if (!d.email) {
        console.log('[CompoundMarketAlert] Validation error: Missing email for EMAIL channel');
        throw new Error('An email address is required for Email channels.');
      }
      // simple regex check
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(d.email)) {
        console.log('[CompoundMarketAlert] Validation error: Invalid email format', { email: d.email });
        throw new Error(`Invalid email address: ${d.email}`);
      }
    } else if (d.type === DeliveryChannelType.WEBHOOK) {
      if (!d.webhookUrl) {
        console.log('[CompoundMarketAlert] Validation error: Missing webhookUrl for WEBHOOK channel');
        throw new Error('A webhook URL is required for Webhook channels.');
      }
      try {
        new URL(d.webhookUrl);
      } catch {
        console.log('[CompoundMarketAlert] Validation error: Invalid webhook URL format', { webhookUrl: d.webhookUrl });
        throw new Error(`Invalid webhook URL: ${d.webhookUrl}`);
      }
    }
  }
  console.log('[CompoundMarketAlert] All delivery channels validated successfully');

  // 1. Look up the user
  console.log('[CompoundMarketAlert] Looking up user in database', { username, spaceId });
  const user = await prisma.user.findUnique({ where: { username_spaceId: { username, spaceId } } });
  if (!user) {
    console.log('[CompoundMarketAlert] User not found in database', { username, spaceId });
    throw new Error('User not found');
  }
  console.log('[CompoundMarketAlert] User found successfully', { userId: user.id });

  // 2. Map chain *names* to prisma connect objects
  console.log('[CompoundMarketAlert] Mapping chain names to Prisma connect objects', { selectedChains });
  const chainConnect = selectedChains.map((chainName) => {
    const cfg = CHAINS.find((c) => c.name === chainName);
    if (!cfg) {
      console.log('[CompoundMarketAlert] Unsupported chain found', { chainName });
      throw new Error(`Unsupported chain: ${chainName}`);
    }
    return { chainId: cfg.chainId };
  });
  console.log('[CompoundMarketAlert] Chain mapping completed', { chainConnectCount: chainConnect.length });

  // 3. Build asset connect objects by pairing each symbol with each selected chain
  console.log('[CompoundMarketAlert] Building asset connect objects', { selectedChains, selectedMarkets });
  const assetConnect = selectedChains.flatMap((chainName) => {
    const chainCfg = CHAINS.find((c) => c.name === chainName)!;
    return selectedMarkets
      .map((uiSymbol) => {
        const symbol = uiSymbol === 'ETH' ? 'WETH' : uiSymbol;
        // find that market on this chain
        const m = MARKETS.find((m) => m.symbol === symbol && m.chainId === chainCfg.chainId);
        if (!m) {
          // no valid market on this chain → skip
          console.log('[CompoundMarketAlert] No valid market found for chain and symbol', { chainName, symbol });
          return null;
        }
        // Prisma PK is "<chainId>_<baseAssetAddress>"
        return {
          chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}`,
        };
      })
      .filter((x): x is { chainId_address: string } => x !== null);
  });
  console.log('[CompoundMarketAlert] Asset connect objects built', { assetConnectCount: assetConnect.length });

  if (assetConnect.length === 0) {
    console.log('[CompoundMarketAlert] No valid markets found for chain+asset selections');
    throw new Error('No valid markets found for your chain+asset selections. Please choose a supported combination.');
  }

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
