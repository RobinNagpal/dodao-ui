import { NextRequest, NextResponse } from 'next/server';
import { useCompoundMarketsAprs } from '@/utils/getCompoundAPR';
import { DeliveryChannelType, NotificationFrequency, AlertActionType } from '@prisma/client';
import { prisma } from '@/prisma';

// map frequency enum → milliseconds
const frequencyToMs: Record<NotificationFrequency, number> = {
  ONCE_PER_ALERT: 0,
  AT_MOST_ONCE_PER_3_HOURS: 3 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_6_HOURS: 6 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_12_HOURS: 12 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_DAY: 24 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest) {
  // 1) Fetch the latest Compound APRs
  const aprs = await useCompoundMarketsAprs()();

  // 2) Persist the snapshot
  await prisma.lendingAndBorrowingRate.createMany({
    data: aprs.map((m) => ({
      protocolName: 'Compound',
      chainId: m.chainId,
      assetChainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
      netEarnAPY: m.netEarnAPY,
      netBorrowAPY: m.netBorrowAPY,
    })),
  });

  // 3) Load all active, non-comparison alerts *with* their relations
  const alerts = await prisma.alert.findMany({
    where: { isComparison: false, status: 'ACTIVE' },
    include: {
      selectedChains: true,
      selectedAssets: true,
      conditions: true,
      deliveryChannels: true,
    },
  });

  let totalSent = 0;

  for (const alert of alerts) {
    // --- Gather all APR hits per (chain, asset) ---
    const rawHitConditionIds = new Set<string>();
    const groups: Array<{
      chain: string;
      asset: string;
      currentRate: number;
      conditions: Array<{
        type: string;
        threshold: number | { low: number; high: number };
      }>;
    }> = [];

    // (A) Pre‑fetch sent condition IDs if ONCE_PER_ALERT
    let previouslySent = new Set<string>();
    if (alert.notificationFrequency === 'ONCE_PER_ALERT') {
      const past = await prisma.alertNotification.findMany({
        where: { alertId: alert.id },
        select: { alertConditionIds: true },
      });
      for (const pn of past) {
        pn.alertConditionIds.forEach((cid) => previouslySent.add(cid));
      }
    }

    // (B) Loop through each chain/asset pair
    for (const chainObj of alert.selectedChains) {
      for (const assetObj of alert.selectedAssets) {
        const chainName = chainObj.name;
        const assetSym = assetObj.symbol;

        // get the latest APR record
        const market = await prisma.lendingAndBorrowingRate.findFirst({
          where: {
            protocolName: 'Compound',
            chainId: chainObj.chainId,
            assetChainId_address: assetObj.chainId_address,
          },
          orderBy: { recordedAt: 'desc' },
        });
        if (!market) continue;

        const aprValue = alert.actionType === AlertActionType.SUPPLY ? market.netEarnAPY : market.netBorrowAPY;

        // filter conditions that fire right now
        let hits = alert.conditions.filter((c) => {
          switch (c.conditionType) {
            case 'APR_RISE_ABOVE':
              return aprValue > (c.thresholdValue ?? 0);
            case 'APR_FALLS_BELOW':
              return aprValue < (c.thresholdValue ?? Infinity);
            case 'APR_OUTSIDE_RANGE':
              return aprValue < (c.thresholdValueLow ?? -Infinity) || aprValue > (c.thresholdValueHigh ?? Infinity);
            default:
              return false;
          }
        });

        // for ONCE_PER_ALERT, drop any condition already sent
        if (alert.notificationFrequency === 'ONCE_PER_ALERT') {
          hits = hits.filter((c) => !previouslySent.has(c.id));
        }

        if (!hits.length) continue;

        // collect IDs
        hits.forEach((c) => rawHitConditionIds.add(c.id));

        // collect IDs and build payload
        groups.push({
          chain: chainName,
          asset: assetSym,
          currentRate: aprValue,
          conditions: hits.map((c) => ({
            type: c.conditionType,
            threshold: c.conditionType === 'APR_OUTSIDE_RANGE' ? { low: c.thresholdValueLow!, high: c.thresholdValueHigh! } : c.thresholdValue!,
          })),
        });
      }
    }

    if (!groups.length) continue;

    // (C) Time‑window guard for non‑ONCE_PER_ALERT frequencies
    if (alert.notificationFrequency !== 'ONCE_PER_ALERT') {
      const last = await prisma.sentNotification.findFirst({
        where: { alertNotification: { alertId: alert.id } },
        orderBy: { sentAt: 'desc' },
      });
      const elapsed = last ? Date.now() - last.sentAt.getTime() : Infinity;
      const window = frequencyToMs[alert.notificationFrequency];
      if (elapsed < window) {
        continue;
      }
    }

    // 4) Broadcast the payload
    const payload = {
      alert: 'Compound Market Alert',
      alertCategory: alert.category,
      alertType: alert.actionType,
      ...(alert.category === 'PERSONALIZED' && {
        walletAddress: alert.walletAddress,
      }),
      triggered: groups,
      timestamp: new Date().toISOString(),
    };

    for (const ch of alert.deliveryChannels) {
      const dest = ch.channelType === DeliveryChannelType.WEBHOOK ? ch.webhookUrl! : ch.email!;

      if (ch.channelType === DeliveryChannelType.WEBHOOK) {
        await fetch(dest, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        console.log(`(email) to ${dest}:`, payload);
      }
    }

    // 5) Record *exactly* which condition IDs were sent in this batch
    await prisma.alertNotification.create({
      data: {
        alertId: alert.id,
        alertConditionIds: Array.from(rawHitConditionIds),
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
