import { NextRequest, NextResponse } from "next/server";
import { useCompoundMarketsAprs } from "@/utils/getCompoundAPR";
import {
  PrismaClient,
  DeliveryChannelType,
  NotificationFrequency,
  AlertActionType,
} from "@prisma/client";
import { prisma } from "@/prisma";

// map frequency enum → milliseconds
const frequencyToMs: Record<NotificationFrequency, number> = {
  AT_MOST_ONCE_PER_3_HOURS: 3 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_6_HOURS: 6 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_12_HOURS: 12 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_DAY: 24 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest) {
  // 1) Fetch APRs from Compound
  const aprs = await useCompoundMarketsAprs()();

  // 2) Persist for tracing
  await prisma.lendingAndBorrowingRate.createMany({
    data: aprs.map((m) => ({
      protocolName: "Compound",
      chain: m.chainName,
      asset: m.asset,
      netEarnAPY: m.netEarnAPY,
      netBorrowAPY: m.netBorrowAPY,
    })),
  });

  // 3) Load active alerts
  const alerts = await prisma.alert.findMany({
    where: { isComparison: false, status: "ACTIVE" },
    include: { conditions: true, deliveryChannels: true },
  });

  let totalSent = 0;

  for (const alert of alerts) {
    // collect raw condition IDs + payload-safe groups
    const rawIds = new Set<string>();
    const groups: Array<{
      chain: string;
      asset: string;
      currentRate: number;
      conditions: Array<{
        type: string;
        threshold: number | { low: number; high: number };
      }>;
    }> = [];

    // evaluate each (chain, asset)
    for (const chainName of alert.selectedChains) {
      for (const asset of alert.selectedAssets) {
        // pull the single latest stored APR
        const market = await prisma.lendingAndBorrowingRate.findFirst({
          where: { protocolName: "Compound", chain: chainName, asset },
          orderBy: { recordedAt: "desc" },
        });
        if (!market) continue;

        const aprValue =
          alert.actionType === AlertActionType.SUPPLY
            ? market.netEarnAPY
            : market.netBorrowAPY;

        // find all matching conditions
        const hits = alert.conditions.filter((cond) => {
          switch (cond.conditionType) {
            case "APR_RISE_ABOVE":
              return aprValue > (cond.thresholdValue ?? 0);
            case "APR_FALLS_BELOW":
              return aprValue < (cond.thresholdValue ?? 0);
            case "APR_OUTSIDE_RANGE":
              return (
                cond.thresholdValueLow! != null &&
                cond.thresholdValueHigh! != null &&
                (aprValue < cond.thresholdValueLow! ||
                  aprValue > cond.thresholdValueHigh!)
              );
            default:
              return false;
          }
        });

        if (!hits.length) continue;

        // collect raw IDs
        hits.forEach((c) => rawIds.add(c.id));

        // build payload-safe object
        groups.push({
          chain: chainName,
          asset,
          currentRate: aprValue,
          conditions: hits.map((c) => ({
            type: c.conditionType,
            threshold:
              c.conditionType === "APR_OUTSIDE_RANGE"
                ? { low: c.thresholdValueLow!, high: c.thresholdValueHigh! }
                : c.thresholdValue!,
          })),
        });
      }
    }

    if (!groups.length) continue;

    const last = await prisma.sentNotification.findFirst({
      where: {
        alertNotification: { alertId: alert.id },
      },
      orderBy: { sentAt: "desc" },
    });
    const elapsed = last ? Date.now() - last.sentAt.getTime() : Infinity;
    const window = frequencyToMs[alert.notificationFrequency];
    if (elapsed < window) continue;

    // 5) send one payload to *every* delivery channel
    const payload = {
      alert: "Compound Market Alert",
      alertType: alert.actionType,
      triggered: groups,
      timestamp: new Date().toISOString(),
    };

    for (const ch of alert.deliveryChannels) {
      const dest =
        ch.channelType === DeliveryChannelType.EMAIL
          ? ch.email!
          : ch.webhookUrl!;

      if (ch.channelType === DeliveryChannelType.WEBHOOK) {
        await fetch(dest, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        console.log(`Email to ${dest}:`, JSON.stringify(payload));
      }
    }

    await prisma.alertNotification.create({
      data: {
        alertId: alert.id,
        alertConditionIds: Array.from(rawIds),
        SentNotification: { create: {} },
      },
    });

    totalSent++;
  }

  return NextResponse.json({
    success: true,
    triggeredNotifications: totalSent,
  });
}
