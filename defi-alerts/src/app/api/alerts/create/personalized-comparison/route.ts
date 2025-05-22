import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType } from '@prisma/client';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

import { CHAINS, MARKETS } from '@/shared/web3/config';

export interface PersonalizedComparisonAlertPayload {
  email: string;
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

async function postHandler(request: NextRequest): Promise<PersonalizedComparisonAlertResponse> {
  const {
    email,
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
  if (!email) {
    throw new Error('Missing required field: email');
  }
  if (!walletAddress) {
    throw new Error('Missing required field: walletAddress');
  }
  if (!category) {
    throw new Error('Missing required field: category');
  }
  if (!actionType) {
    throw new Error('Missing required field: actionType');
  }
  if (!isComparison) {
    throw new Error('Missing required field: isComparison must be true for comparison alerts');
  }
  if (!Array.isArray(selectedChains) || selectedChains.length === 0) {
    throw new Error('Missing required field: selectedChains must be a non-empty array');
  }
  if (!Array.isArray(selectedMarkets) || selectedMarkets.length === 0) {
    throw new Error('Missing required field: selectedMarkets must be a non-empty array');
  }
  if (!Array.isArray(compareProtocols) || compareProtocols.length === 0) {
    throw new Error('Missing required field: compareProtocols must be a non-empty array');
  }
  if (!Array.isArray(conditions) || conditions.length === 0) {
    throw new Error('Missing required field: conditions must be a non-empty array');
  }
  if (!Array.isArray(deliveryChannels) || deliveryChannels.length === 0) {
    throw new Error('Missing required field: deliveryChannels must be a non-empty array');
  }

  // Validate conditions
  for (const c of conditions) {
    if (!c.value) {
      throw new Error('A threshold value is required for comparison conditions.');
    }
    if (isNaN(Number(c.value))) {
      throw new Error('Threshold values must be valid numbers.');
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
  const user = await prisma.user.findUnique({ where: { email_spaceId: { email, spaceId: 'default-alerts-space' } } });
  if (!user) {
    throw new Error('User not found');
  }

  // Map chains → Prisma connect
  const chainConnect = selectedChains.map((name) => {
    const cfg = CHAINS.find((c) => c.name === name);
    if (!cfg) throw new Error(`Unsupported chain: ${name}`);
    return { chainId: cfg.chainId };
  });

  // Map markets → Prisma connect (with ETH→WETH)
  const assetConnect = selectedChains.flatMap((chainName) => {
    const cfg = CHAINS.find((c) => c.name === chainName)!;
    return selectedMarkets
      .map((uiSymbol) => {
        const symbol = uiSymbol === 'ETH' ? 'WETH' : uiSymbol;
        const m = MARKETS.find((m) => m.chainId === cfg.chainId && m.symbol === symbol);
        if (!m) return null;
        return {
          chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}`,
        };
      })
      .filter((x): x is { chainId_address: string } => x !== null);
  });

  if (assetConnect.length === 0) {
    throw new Error('No valid markets found for those chains/markets. Please adjust your selection.');
  }

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

export const POST = withErrorHandlingV2<PersonalizedComparisonAlertResponse>(postHandler);
