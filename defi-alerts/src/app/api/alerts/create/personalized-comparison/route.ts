import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import {
  AlertCategory,
  AlertActionType,
  NotificationFrequency,
  ConditionType,
  SeverityLevel,
  DeliveryChannelType,
} from "@prisma/client";

interface PersonalizedComparisonRequest {
  email: string;
  walletAddress: string;
  category: AlertCategory;
  actionType: AlertActionType;
  isComparison: boolean;
  selectedChains: string[];
  selectedMarkets: string[];
  compareProtocols: string[];
  notificationFrequency: NotificationFrequency;
  conditions: {
    type: ConditionType;
    value: string;
    severity: SeverityLevel;
  }[];
  deliveryChannels: {
    type: DeliveryChannelType;
    email?: string;
    webhookUrl?: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const payload: PersonalizedComparisonRequest = await request.json();

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
    } = payload;

    // validate required fields
    if (
      !email ||
      !walletAddress ||
      !actionType ||
      !isComparison ||
      !compareProtocols?.length ||
      !conditions?.length ||
      !deliveryChannels?.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // create alert
    const alert = await prisma.alert.create({
      data: {
        user: { connect: { id: user.id } },
        category,
        actionType,
        isComparison: true,
        walletAddress,
        selectedChains,
        selectedMarkets,
        compareProtocols,
        notificationFrequency,
        conditions: {
          create: conditions.map((c) => ({
            conditionType: c.type,
            thresholdValue: c.value ? parseFloat(c.value) : undefined,
            severity: c.severity,
          })),
        },
        deliveryChannels: {
          create: deliveryChannels.map((d) => ({
            channelType: d.type,
            email: d.email,
            webhookUrl: d.webhookUrl,
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, alertId: alert.id });
  } catch (err: any) {
    console.error("Failed to create personalized comparison alert:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
