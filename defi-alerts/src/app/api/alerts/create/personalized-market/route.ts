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
    }: AlertRequestBody = await request.json();

    // Basic validation
    if (
      !email ||
      !walletAddress ||
      !actionType ||
      !notificationFrequency ||
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

    const alert = await prisma.alert.create({
      data: {
        user: { connect: { id: user.id } },
        category,
        actionType,
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
            thresholdValueLow: c.min ? parseFloat(c.min) : undefined,
            thresholdValueHigh: c.max ? parseFloat(c.max) : undefined,
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
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
