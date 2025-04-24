import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

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
    } = await request.json();

    if (!email || !actionType || !selectedChains?.length || !conditions) {
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
        actionType: actionType as any,
        selectedChains,
        selectedMarkets,
        compareProtocols: [], // extend when you collect protocols
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
            webhookUrl: d.type === "WEBHOOK" ? d.url : undefined,
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
