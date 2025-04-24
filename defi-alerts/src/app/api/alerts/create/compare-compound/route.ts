import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      actionType,
      isComparison,
      selectedChains,
      selectedMarkets,
      compareProtocols,
      notificationFrequency,
      conditions,
      deliveryChannels,
    } = await request.json();

    if (
      !email ||
      !actionType ||
      !isComparison ||
      !compareProtocols?.length ||
      !conditions?.length
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
        actionType: actionType as any,
        isComparison: true,
        selectedChains,
        selectedMarkets,
        compareProtocols,
        notificationFrequency: notificationFrequency as any,
        conditions: {
          create: conditions.map((c: any) => ({
            conditionType: c.type,
            thresholdValue: parseFloat(c.value),
            severity: c.severity as any,
          })),
        },
        deliveryChannels: {
          create: deliveryChannels.map((d: any) => ({
            channelType: d.type as any,
            email: d.email,
            webhookUrl: d.url,
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
