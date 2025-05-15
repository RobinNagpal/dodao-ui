import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType } from '@prisma/client';

import { CHAINS, MARKETS } from '@/shared/web3/config';

interface CompareCompoundRequest {
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

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CompareCompoundRequest;
    const {
      email,
      category,
      actionType,
      isComparison,
      selectedChains,
      selectedMarkets,
      compareProtocols,
      notificationFrequency,
      conditions,
      deliveryChannels,
    } = payload;

    // Basic validation
    if (
      !email ||
      !isComparison ||
      !actionType ||
      !selectedChains.length ||
      !selectedMarkets.length ||
      !compareProtocols.length ||
      !conditions.length ||
      !deliveryChannels.length
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Map chains → Prisma connect
    const chainConnect = selectedChains.map((name) => {
      const cfg = CHAINS.find((c) => c.name === name);
      if (!cfg) throw new Error(`Unsupported chain: ${name}`);
      return { chainId: cfg.chainId };
    });

    // Map assets → Prisma connect (with ETH→WETH)
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

    if (!assetConnect.length) {
      return NextResponse.json(
        {
          error: 'No valid markets found for those chains/markets. Please adjust your selection.',
        },
        { status: 400 }
      );
    }

    // Create alert
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

    return NextResponse.json({ ok: true, alertId: alert.id });
  } catch (err: any) {
    console.error('[compare-compound route] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
