import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

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
    } = await request.json();

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
          create: conditions.map((c: any) => ({
            conditionType: c.type,
            thresholdValue: parseFloat(c.value || c.threshold),
            severity: c.severity,
            ...(c.min !== undefined && {
              thresholdValueLow: parseFloat(c.min),
            }),
            ...(c.max !== undefined && {
              thresholdValueHigh: parseFloat(c.max),
            }),
          })),
        },
        deliveryChannels: {
          create: deliveryChannels.map((d: any) => ({
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
