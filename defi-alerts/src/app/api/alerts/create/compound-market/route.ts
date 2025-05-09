import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import {
  AlertActionType,
  NotificationFrequency,
  ConditionType,
  SeverityLevel,
  DeliveryChannelType,
} from "@prisma/client";

import { CHAINS, MARKETS } from "@/shared/web3/config";

type Payload = {
  email: string;
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
};

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      actionType,
      selectedChains,
      selectedMarkets,
      notificationFrequency,
      conditions,
      deliveryChannels,
    } = (await request.json()) as Payload;

    if (
      !email ||
      !actionType ||
      !Array.isArray(selectedChains) ||
      selectedChains.length === 0 ||
      !Array.isArray(selectedMarkets) ||
      selectedMarkets.length === 0 ||
      !notificationFrequency ||
      !Array.isArray(conditions) ||
      conditions.length === 0 ||
      !Array.isArray(deliveryChannels) ||
      deliveryChannels.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Look up the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Map chain *names* to prisma connect objects
    const chainConnect = selectedChains.map((chainName) => {
      const cfg = CHAINS.find((c) => c.name === chainName);
      if (!cfg) {
        throw new Error(`Unsupported chain: ${chainName}`);
      }
      return { chainId: cfg.chainId };
    });

    // 3. Build asset connect objects by pairing each symbol with each selected chain
    const assetConnect = selectedChains.flatMap((chainName) => {
      const chainCfg = CHAINS.find((c) => c.name === chainName)!;
      return selectedMarkets
        .map((uiSymbol) => {
          const symbol = uiSymbol === "ETH" ? "WETH" : uiSymbol;
          // find that market on this chain
          const m = MARKETS.find(
            (m) => m.symbol === symbol && m.chainId === chainCfg.chainId
          );
          if (!m) {
            // no valid market on this chain → skip
            return null;
          }
          // Prisma PK is “<chainId>_<baseAssetAddress>”
          return {
            chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}`,
          };
        })
        .filter((x): x is { chainId_address: string } => x !== null);
    });

    if (assetConnect.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid markets found for your chain+asset selections. Please choose a supported combination.",
        },
        { status: 400 }
      );
    }

    // 4. Create the alert
    const alert = await prisma.alert.create({
      data: {
        user: { connect: { id: user.id } },
        category: "GENERAL",
        actionType,
        // now using relational connects:
        selectedChains: { connect: chainConnect },
        selectedAssets: { connect: assetConnect },
        compareProtocols: [],
        notificationFrequency,
        conditions: {
          create: conditions.map((c) => ({
            conditionType: c.type,
            thresholdValue:
              c.type !== "APR_OUTSIDE_RANGE" && c.value
                ? parseFloat(c.value)
                : undefined,
            thresholdValueLow:
              c.type === "APR_OUTSIDE_RANGE" && c.min
                ? parseFloat(c.min)
                : undefined,
            thresholdValueHigh:
              c.type === "APR_OUTSIDE_RANGE" && c.max
                ? parseFloat(c.max)
                : undefined,
            severity: c.severity,
          })),
        },
        deliveryChannels: {
          create: deliveryChannels.map((d) => ({
            channelType: d.type,
            email: d.type === "EMAIL" ? d.email : undefined,
            webhookUrl: d.type === "WEBHOOK" ? d.webhookUrl : undefined,
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, alertId: alert.id });
  } catch (err: any) {
    console.error("[compound-market route] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
