import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { AlertCategory, AlertActionType, NotificationFrequency, ConditionType, SeverityLevel, DeliveryChannelType } from '@prisma/client';

import { CHAINS, MARKETS } from '@/shared/web3/config';

interface AlertRequestBody {
  email: string;
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AlertRequestBody;
    const {
      email,
      walletAddress,
      category,
      actionType,
      selectedChains,
      selectedMarkets,
      compareProtocols,
      notificationFrequency,
      conditions,
      deliveryChannels,
    } = body;

    // Basic validation
    if (
      !email ||
      !walletAddress ||
      !category ||
      !actionType ||
      !selectedChains.length ||
      !selectedMarkets.length ||
      !notificationFrequency ||
      !conditions.length ||
      !deliveryChannels.length
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch or 404
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
          // “ETH” on UI → symbol “WETH”
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
            thresholdValue: c.value ? parseFloat(c.value) : undefined,
            thresholdValueLow: c.min ? parseFloat(c.min) : undefined,
            thresholdValueHigh: c.max ? parseFloat(c.max) : undefined,
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
    console.error('[personalized-market route] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
