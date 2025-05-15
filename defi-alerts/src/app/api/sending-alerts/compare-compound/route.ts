import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { useCompoundMarketsAprs } from '@/utils/getCompoundAPR';
import { useAaveAprs } from '@/utils/getAaveAPR';
import { useSparkAprs } from '@/utils/getSparkAPR';
import { DeliveryChannelType, NotificationFrequency, AlertActionType, ConditionType } from '@prisma/client';

// map NotificationFrequency → cooldown in milliseconds
const frequencyToMs: Record<NotificationFrequency, number> = {
  ONCE_PER_ALERT: 0,
  AT_MOST_ONCE_PER_3_HOURS: 3 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_6_HOURS: 6 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_12_HOURS: 12 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_DAY: 24 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
};

export async function GET(request: NextRequest) {
  // 1) Fetch APRs from all protocols
  const [compound, aave, spark] = await Promise.all([useCompoundMarketsAprs()(), useAaveAprs()(), useSparkAprs()()]);

  // Build a set of keys for active Compound markets only
  const compoundKeys = new Set(compound.map((m) => `${m.chainId}_${m.assetAddress.toLowerCase()}`));

  // 1a) Upsert only those assets that exist in Compound markets
  const compoundAssets = compound.map((m) => ({
    chainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
    chainId: m.chainId,
    symbol: m.asset,
    address: m.assetAddress.toLowerCase(),
  }));

  // Filter Aave and Spark to include only keys present in Compound
  const aaveAssets = aave
    .filter((m) => compoundKeys.has(`${m.chainId}_${m.assetAddress.toLowerCase()}`))
    .map((m) => ({
      chainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
      chainId: m.chainId,
      symbol: m.asset,
      address: m.assetAddress.toLowerCase(),
    }));

  const sparkAssets = spark
    .filter((m) => compoundKeys.has(`${m.chainId}_${m.assetAddress.toLowerCase()}`))
    .map((m) => ({
      chainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
      chainId: m.chainId,
      symbol: m.asset,
      address: m.assetAddress.toLowerCase(),
    }));

  const uniqueAssets = Array.from(new Map([...compoundAssets, ...aaveAssets, ...sparkAssets].map((a) => [a.chainId_address, a])).values());

  await prisma.asset.createMany({
    data: uniqueAssets,
    skipDuplicates: true,
  });

  // 1b) Persist raw APR snapshots for debugging
  await prisma.lendingAndBorrowingRate.createMany({
    data: [
      ...compound.map((m) => ({
        protocolName: 'Compound',
        chainId: m.chainId,
        assetChainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
        netEarnAPY: m.netEarnAPY,
        netBorrowAPY: m.netBorrowAPY,
      })),
      ...aave
        .filter((m) => compoundKeys.has(`${m.chainId}_${m.assetAddress.toLowerCase()}`))
        .map((m) => ({
          protocolName: 'AAVE',
          chainId: m.chainId,
          assetChainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
          netEarnAPY: m.netEarnAPY,
          netBorrowAPY: m.netBorrowAPY,
        })),
      ...spark
        .filter((m) => compoundKeys.has(`${m.chainId}_${m.assetAddress.toLowerCase()}`))
        .map((m) => ({
          protocolName: 'Spark',
          chainId: m.chainId,
          assetChainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
          netEarnAPY: m.netEarnAPY,
          netBorrowAPY: m.netBorrowAPY,
        })),
    ],
  });

  // 2) Load comparison alerts
  const alerts = await prisma.alert.findMany({
    where: { isComparison: true, status: 'ACTIVE' },
    include: {
      selectedChains: true,
      selectedAssets: true,
      conditions: true,
      deliveryChannels: true,
    },
  });

  let totalSent = 0;

  for (const alert of alerts) {
    // A) ONCE_PER_ALERT de-duplication
    const previouslySent = new Set<string>();
    if (alert.notificationFrequency === 'ONCE_PER_ALERT') {
      const past = await prisma.alertNotification.findMany({
        where: { alertId: alert.id },
        select: { alertConditionIds: true },
      });
      past.forEach((p) => p.alertConditionIds.forEach((id) => previouslySent.add(id)));
    }

    // B) Cooldown check for other frequencies
    let elapsed = Infinity;
    const windowMs = frequencyToMs[alert.notificationFrequency];
    if (alert.notificationFrequency !== 'ONCE_PER_ALERT') {
      const last = await prisma.sentNotification.findFirst({
        where: { alertNotification: { alertId: alert.id } },
        orderBy: { sentAt: 'desc' },
      });
      elapsed = last ? Date.now() - last.sentAt.getTime() : Infinity;
    }
    if (alert.notificationFrequency !== 'ONCE_PER_ALERT' && elapsed < windowMs) continue;

    // C) Evaluate each chain/asset/protocol
    const hitIds = new Set<string>();
    const groups: Array<{
      chain: string;
      asset: string;
      protocol: string;
      compoundRate: number;
      protocolRate: number;
      diff: number;
      condition: { type: ConditionType; threshold: number };
    }> = [];

    for (const chainObj of alert.selectedChains) {
      for (const assetObj of alert.selectedAssets) {
        const key = `${chainObj.chainId}_${assetObj.address.toLowerCase()}`;

        // fetch latest Compound APR
        const compM = await prisma.lendingAndBorrowingRate.findFirst({
          where: {
            protocolName: { equals: 'Compound', mode: 'insensitive' },
            chainId: chainObj.chainId,
            assetChainId_address: key,
          },
          orderBy: { recordedAt: 'desc' },
        });
        if (!compM) continue;

        // compare against each protocol
        for (const proto of alert.compareProtocols) {
          const otherM = await prisma.lendingAndBorrowingRate.findFirst({
            where: {
              protocolName: { equals: proto, mode: 'insensitive' },
              chainId: chainObj.chainId,
              assetChainId_address: key,
            },
            orderBy: { recordedAt: 'desc' },
          });
          if (!otherM) continue;

          const compRate = alert.actionType === AlertActionType.SUPPLY ? compM.netEarnAPY : compM.netBorrowAPY;
          const otherRate = alert.actionType === AlertActionType.SUPPLY ? otherM.netEarnAPY : otherM.netBorrowAPY;

          // compute diff
          const diff = alert.actionType === AlertActionType.SUPPLY ? compM.netEarnAPY - otherM.netEarnAPY : otherM.netBorrowAPY - compM.netBorrowAPY;

          // check each RATE_DIFF condition
          for (const c of alert.conditions) {
            if (
              (c.conditionType === ConditionType.RATE_DIFF_ABOVE && diff > (c.thresholdValue ?? 0)) ||
              (c.conditionType === ConditionType.RATE_DIFF_BELOW && diff > (c.thresholdValue ?? 0))
            ) {
              if (alert.notificationFrequency === 'ONCE_PER_ALERT' && previouslySent.has(c.id)) continue;

              hitIds.add(c.id);
              groups.push({
                chain: chainObj.name,
                asset: assetObj.symbol,
                protocol: proto,
                compoundRate: +compRate.toFixed(2),
                protocolRate: +otherRate.toFixed(2),
                diff: +diff.toFixed(2),
                condition: {
                  type: c.conditionType,
                  threshold: c.thresholdValue!,
                },
              });
            }
          }
        }
      }
    }

    if (groups.length === 0) continue;

    // D) Broadcast
    const payload = {
      alert: 'Compound vs. Other Protocol Comparison',
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

    // E) Log
    await prisma.alertNotification.create({
      data: {
        alertId: alert.id,
        alertConditionIds: Array.from(hitIds),
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
