import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType, Alert } from '@prisma/client';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

import { CHAINS, MARKETS } from '@/shared/web3/config';

export interface CompareCompoundAlertPayload {
  email: string;
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

async function postHandler(request: NextRequest): Promise<CompareCompoundAlertResponse> {
  console.log('[CompareCompoundAlert] Starting postHandler');

  const { email, category, actionType, isComparison, selectedChains, selectedMarkets, compareProtocols, notificationFrequency, conditions, deliveryChannels } =
    (await request.json()) as CompareCompoundAlertPayload;

  console.log('[CompareCompoundAlert] Request payload:', {
    email,
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
  if (!email) {
    console.log('[CompareCompoundAlert] Validation error: Missing email');
    throw new Error('Missing required field: email');
  }
  if (!isComparison) {
    console.log('[CompareCompoundAlert] Validation error: isComparison must be true');
    throw new Error('Missing required field: isComparison must be true for comparison alerts');
  }
  if (!actionType) {
    console.log('[CompareCompoundAlert] Validation error: Missing actionType');
    throw new Error('Missing required field: actionType');
  }
  if (!Array.isArray(selectedChains) || selectedChains.length === 0) {
    console.log('[CompareCompoundAlert] Validation error: selectedChains must be a non-empty array');
    throw new Error('Missing required field: selectedChains must be a non-empty array');
  }
  if (!Array.isArray(selectedMarkets) || selectedMarkets.length === 0) {
    console.log('[CompareCompoundAlert] Validation error: selectedMarkets must be a non-empty array');
    throw new Error('Missing required field: selectedMarkets must be a non-empty array');
  }
  if (!Array.isArray(compareProtocols) || compareProtocols.length === 0) {
    console.log('[CompareCompoundAlert] Validation error: compareProtocols must be a non-empty array');
    throw new Error('Missing required field: compareProtocols must be a non-empty array');
  }
  if (!Array.isArray(conditions) || conditions.length === 0) {
    console.log('[CompareCompoundAlert] Validation error: conditions must be a non-empty array');
    throw new Error('Missing required field: conditions must be a non-empty array');
  }
  if (!Array.isArray(deliveryChannels) || deliveryChannels.length === 0) {
    console.log('[CompareCompoundAlert] Validation error: deliveryChannels must be a non-empty array');
    throw new Error('Missing required field: deliveryChannels must be a non-empty array');
  }
  console.log('[CompareCompoundAlert] Basic validation passed');

  // Validate conditions
  console.log('[CompareCompoundAlert] Validating conditions');
  for (const c of conditions) {
    if (!c.value) {
      console.log('[CompareCompoundAlert] Validation error: Missing value for condition', { conditionType: c.type });
      throw new Error('A threshold value is required for all comparison conditions.');
    }
    if (isNaN(Number(c.value))) {
      console.log('[CompareCompoundAlert] Validation error: Invalid value for condition', { conditionType: c.type, value: c.value });
      throw new Error('Threshold values must be valid numbers.');
    }
  }
  console.log('[CompareCompoundAlert] All conditions validated successfully');

  // Validate delivery channels
  console.log('[CompareCompoundAlert] Validating delivery channels');
  for (const d of deliveryChannels) {
    if (d.type === DeliveryChannelType.EMAIL) {
      if (!d.email) {
        console.log('[CompareCompoundAlert] Validation error: Missing email for EMAIL channel');
        throw new Error('An email address is required for Email channels.');
      }
      // simple regex check
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(d.email)) {
        console.log('[CompareCompoundAlert] Validation error: Invalid email format', { email: d.email });
        throw new Error(`Invalid email address: ${d.email}`);
      }
    } else if (d.type === DeliveryChannelType.WEBHOOK) {
      if (!d.webhookUrl) {
        console.log('[CompareCompoundAlert] Validation error: Missing webhookUrl for WEBHOOK channel');
        throw new Error('A webhook URL is required for Webhook channels.');
      }
      try {
        new URL(d.webhookUrl);
      } catch {
        console.log('[CompareCompoundAlert] Validation error: Invalid webhook URL format', { webhookUrl: d.webhookUrl });
        throw new Error(`Invalid webhook URL: ${d.webhookUrl}`);
      }
    }
  }
  console.log('[CompareCompoundAlert] All delivery channels validated successfully');

  // Fetch user
  console.log('[CompareCompoundAlert] Looking up user in database', { email, spaceId: 'default-alerts-space' });
  const user = await prisma.user.findUnique({ where: { email_spaceId: { email, spaceId: 'default-alerts-space' } } });
  if (!user) {
    console.log('[CompareCompoundAlert] User not found in database', { email });
    throw new Error('User not found');
  }
  console.log('[CompareCompoundAlert] User found successfully', { userId: user.id });

  // Map chains → Prisma connect
  console.log('[CompareCompoundAlert] Mapping chain names to Prisma connect objects', { selectedChains });
  const chainConnect = selectedChains.map((name) => {
    const cfg = CHAINS.find((c) => c.name === name);
    if (!cfg) {
      console.log('[CompareCompoundAlert] Unsupported chain found', { chainName: name });
      throw new Error(`Unsupported chain: ${name}`);
    }
    return { chainId: cfg.chainId };
  });
  console.log('[CompareCompoundAlert] Chain mapping completed', { chainConnectCount: chainConnect.length });

  // Map assets → Prisma connect (with ETH→WETH)
  console.log('[CompareCompoundAlert] Building asset connect objects', { selectedChains, selectedMarkets });
  const assetConnect = selectedChains.flatMap((chainName) => {
    const cfg = CHAINS.find((c) => c.name === chainName)!;
    return selectedMarkets
      .map((uiSymbol) => {
        const symbol = uiSymbol === 'ETH' ? 'WETH' : uiSymbol;
        const m = MARKETS.find((m) => m.chainId === cfg.chainId && m.symbol === symbol);
        if (!m) {
          console.log('[CompareCompoundAlert] No valid market found for chain and symbol', { chainName, symbol });
          return null;
        }
        // Prisma PK is "<chainId>_<baseAssetAddress>"
        return {
          chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}`,
        };
      })
      .filter((x): x is { chainId_address: string } => x !== null);
  });
  console.log('[CompareCompoundAlert] Asset connect objects built', { assetConnectCount: assetConnect.length });

  if (assetConnect.length === 0) {
    console.log('[CompareCompoundAlert] No valid markets found for chain+asset selections');
    throw new Error('No valid markets found for those chains/markets. Please adjust your selection.');
  }

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

export const POST = withErrorHandlingV2<CompareCompoundAlertResponse>(postHandler);
