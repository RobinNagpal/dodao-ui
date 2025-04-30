import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import {
  AlertActionType,
  NotificationFrequency,
  ConditionType,
  SeverityLevel,
  DeliveryChannelType,
} from "@prisma/client";

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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const alert = await prisma.alert.create({
      data: {
        user: { connect: { id: user.id } },
        category: "GENERAL",
        actionType,
        selectedChains,
        selectedMarkets,
        compareProtocols: [],
        notificationFrequency: notificationFrequency as any,
        conditions: {
          create: conditions.map((c: any) => ({
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
            severity: c.severity as any,
          })),
        },
        deliveryChannels: {
          create: deliveryChannels.map((d: any) => ({
            channelType: d.type as any,
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
