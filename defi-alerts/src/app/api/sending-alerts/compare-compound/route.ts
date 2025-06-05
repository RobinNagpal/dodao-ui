import { prisma } from '@/prisma';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { useAaveAprs as getAaveAprs } from '@/utils/getAaveAPR';
import { useCompoundMarketsAprs as getCompoundMarketsAprs } from '@/utils/getCompoundAPR';
import { useSparkAprs as getSparkAprs } from '@/utils/getSparkAPR';
import { sendAlertNotificationEmail } from '@/app/api/sending-alerts/send-alert-notification';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import {
  Alert,
  AlertActionType,
  AlertNotification,
  Asset,
  AlertCondition,
  DeliveryChannel,
  Chain,
  ConditionType,
  DeliveryChannelType,
  NotificationFrequency,
} from '@prisma/client';
import { NextRequest } from 'next/server';
import { fetchMorphoPositionsForWallet } from '@/utils/fetchMorphoPositionsForWallet';

// Types
interface CompareCompoundResponse {
  success: boolean;
  triggeredNotifications: number;
}

interface ProtocolMarket {
  chainId: number;
  asset: string;
  assetAddress: string;
  netEarnAPY: number;
  netBorrowAPY: number;
}

interface AssetData {
  chainId_address: string;
  chainId: number;
  symbol: string;
  address: string;
}

interface NotificationPayload {
  alert: string;
  alertCategory: string;
  alertType: AlertActionType;
  walletAddress?: string | null;
  triggered: AlertTriggerValuesInterface[];
  timestamp: string;
}

// map NotificationFrequency → cooldown in milliseconds
const frequencyToMs: Record<NotificationFrequency, number> = {
  ONCE_PER_ALERT: 0,
  AT_MOST_ONCE_PER_3_HOURS: 3 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_6_HOURS: 6 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_12_HOURS: 12 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_DAY: 24 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Fetches APRs from all protocols and processes them
 */
async function fetchAndProcessProtocolAPRs() {
  const [compound, aave, spark] = await Promise.all([getCompoundMarketsAprs()(), getAaveAprs()(), getSparkAprs()()]);

  // Build a set of keys for active Compound markets only
  const compoundKeys = new Set(compound.map((m) => `${m.chainId}_${m.assetAddress.toLowerCase()}`));

  // Process Compound assets
  const compoundAssets = compound.map((m) => ({
    chainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
    chainId: m.chainId,
    symbol: m.asset,
    address: m.assetAddress.toLowerCase(),
  }));

  // Filter Aave assets to include only keys present in Compound
  const aaveAssets = aave
    .filter((m) => compoundKeys.has(`${m.chainId}_${m.assetAddress.toLowerCase()}`))
    .map((m) => ({
      chainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
      chainId: m.chainId,
      symbol: m.asset,
      address: m.assetAddress.toLowerCase(),
    }));

  // Filter Spark assets to include only keys present in Compound
  const sparkAssets = spark
    .filter((m) => compoundKeys.has(`${m.chainId}_${m.assetAddress.toLowerCase()}`))
    .map((m) => ({
      chainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
      chainId: m.chainId,
      symbol: m.asset,
      address: m.assetAddress.toLowerCase(),
    }));

  return {
    compound,
    aave,
    spark,
    compoundKeys,
    compoundAssets,
    aaveAssets,
    sparkAssets,
  };
}

/**
 * Persists unique assets to the database
 */
async function persistAssets(compoundAssets: AssetData[], aaveAssets: AssetData[], sparkAssets: AssetData[]) {
  const uniqueAssets = Array.from(new Map([...compoundAssets, ...aaveAssets, ...sparkAssets].map((a) => [a.chainId_address, a])).values());

  await prisma.asset.createMany({
    data: uniqueAssets,
    skipDuplicates: true,
  });
}

/**
 * Persists APR snapshots for all protocols
 */
async function persistAPRSnapshots(compound: ProtocolMarket[], aave: ProtocolMarket[], spark: ProtocolMarket[], compoundKeys: Set<string>) {
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
}

/**
 * Loads active comparison alerts
 */
async function loadComparisonAlerts() {
  return prisma.alert.findMany({
    where: { isComparison: true, status: 'ACTIVE' },
    include: {
      selectedChains: true,
      selectedAssets: true,
      conditions: true,
      deliveryChannels: true,
    },
  });
}

/**
 * Checks if an alert should be processed based on its notification frequency
 */
async function shouldProcessAlert(
  alert: Alert & {
    selectedChains: any[];
    selectedAssets: any[];
    conditions: any[];
    deliveryChannels: any[];
  }
) {
  // For ONCE_PER_ALERT, get previously sent condition IDs
  const previouslySent = new Set<string>();
  if (alert.notificationFrequency === 'ONCE_PER_ALERT') {
    const past = await prisma.alertNotification.findMany({
      where: { alertId: alert.id },
      select: { alertConditionIds: true },
    });
    past.forEach((p) => p.alertConditionIds.forEach((id) => previouslySent.add(id)));
  }

  // For other frequencies, check cooldown period
  let shouldProcess = true;
  if (alert.notificationFrequency !== 'ONCE_PER_ALERT') {
    const windowMs = frequencyToMs[alert.notificationFrequency];
    const last = await prisma.sentNotification.findFirst({
      where: { alertNotification: { alertId: alert.id } },
      orderBy: { sentAt: 'desc' },
    });
    const elapsed = last ? Date.now() - last.sentAt.getTime() : Infinity;
    shouldProcess = elapsed >= windowMs;
  }

  return { shouldProcess, previouslySent };
}

/**
 * Evaluates conditions for an alert and creates notification triggerValues
 */
async function evaluateConditions(
  alert: Alert & {
    selectedChains: Chain[];
    selectedAssets: Asset[];
    conditions: AlertCondition[];
    deliveryChannels: DeliveryChannel[];
  },
  previouslySent: Set<string>
): Promise<AlertTriggerValuesInterface[]> {
  const hitIds = new Set<string>();
  const triggerValues: AlertTriggerValuesInterface[] = [];

  let morphoPositions: ReturnType<typeof fetchMorphoPositionsForWallet> extends Promise<infer U> ? U : never = [];
  if (alert.walletAddress && alert.compareProtocols.some((p) => p.toLowerCase() === 'morpho')) {
    morphoPositions = await fetchMorphoPositionsForWallet(alert.walletAddress);
  }

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
        let otherRate: number | null = null;
        if (proto.toLowerCase() === 'morpho') {
          const morphoMatch = morphoPositions.find(
            (pos) =>
              pos.chain.toLowerCase() === chainObj.name.toLowerCase() &&
              pos.assetAddress.toLowerCase() === assetObj.address.toLowerCase() &&
              pos.actionType === alert.actionType &&
              pos.id === alert.marketId
          );

          if (!morphoMatch || morphoMatch.disable) {
            continue;
          }
          otherRate = parseFloat(morphoMatch.rate.replace('%', ''));
        } else {
          const otherM = await prisma.lendingAndBorrowingRate.findFirst({
            where: {
              protocolName: { equals: proto, mode: 'insensitive' },
              chainId: chainObj.chainId,
              assetChainId_address: key,
            },
            orderBy: { recordedAt: 'desc' },
          });
          if (!otherM) {
            continue;
          }
          otherRate = alert.actionType === AlertActionType.SUPPLY ? otherM.netEarnAPY : otherM.netBorrowAPY;
        }

        const compRate = alert.actionType === AlertActionType.SUPPLY ? compM.netEarnAPY : compM.netBorrowAPY;
        const diff = alert.actionType === AlertActionType.SUPPLY ? compRate - otherRate : otherRate - compRate;

        // check each RATE_DIFF condition
        for (const c of alert.conditions) {
          if (
            (c.conditionType === ConditionType.RATE_DIFF_ABOVE && diff > (c.thresholdValue ?? 0)) ||
            (c.conditionType === ConditionType.RATE_DIFF_BELOW && diff > (c.thresholdValue ?? 0))
          ) {
            if (alert.notificationFrequency === 'ONCE_PER_ALERT' && previouslySent.has(c.id)) continue;

            hitIds.add(c.id);
            triggerValues.push({
              chainName: chainObj.name,
              asset: assetObj.symbol,
              chainId: chainObj.chainId,
              assetSymbol: assetObj.symbol,
              assetAddress: assetObj.address,
              isComparison: true,
              protocol: proto,
              compoundRate: +compRate.toFixed(2),
              protocolRate: +otherRate.toFixed(2),
              diff: +diff.toFixed(2),
              notificationFrequency: alert.notificationFrequency,
              severity: c.severity,
              condition: {
                type: c.conditionType,
                threshold: c.thresholdValue!,
                alertConditionId: c.id,
              },
            });
          }
        }
      }
    }
  }
  console.log('the triggerValues: ', JSON.stringify(triggerValues, null, 2));

  return triggerValues;
}

/**
 * Creates and sends notifications for triggered conditions
 */
async function sendNotifications(
  alert: Alert & {
    selectedChains: any[];
    selectedAssets: any[];
    conditions: any[];
    deliveryChannels: any[];
  },
  triggerValues: AlertTriggerValuesInterface[]
) {
  const payload: NotificationPayload = {
    alert: 'Compound vs. Other Protocol Comparison',
    alertCategory: alert.category,
    alertType: alert.actionType,
    ...(alert.category === 'PERSONALIZED' && {
      walletAddress: alert.walletAddress,
    }),
    triggered: triggerValues,
    timestamp: new Date().toISOString(),
  };

  for (const ch of alert.deliveryChannels) {
    const dest = ch.channelType === DeliveryChannelType.WEBHOOK ? ch.webhookUrl! : ch.email!;
    if (ch.channelType === DeliveryChannelType.WEBHOOK) {
      try {
        await fetch(dest, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error(`Error sending webhook notification to ${dest}:`, error);
        await logError(
          'Error sending webhook notification in compare-compound',
          {
            alertId: alert.id,
            webhookUrl: dest,
            payload,
          },
          error as Error
        );
      }
    } else {
      try {
        await sendAlertNotificationEmail({
          email: dest,
          payload,
        });
      } catch (error) {
        console.error(`Error sending email notification to ${dest}:`, error);
        await logError(
          'Error sending email notification in compare-compound',
          {
            alertId: alert.id,
            email: dest,
            payload,
          },
          error as Error
        );
      }
    }
  }
}

/**
 * Logs notification to the database
 */
async function logNotification(alertId: string, triggerValues: AlertTriggerValuesInterface[]) {
  await prisma.alertNotification.create({
    data: {
      alertId: alertId,
      alertConditionIds: triggerValues.map((v) => v.condition.alertConditionId),
      triggeredValues: triggerValues,
      SentNotification: { create: {} },
    },
  });
}

/**
 * Main handler function for the API route
 */
async function compareCompoundHandler(request: NextRequest): Promise<CompareCompoundResponse> {
  // 1) Fetch and process APRs from all protocols
  const { compound, aave, spark, compoundKeys, compoundAssets, aaveAssets, sparkAssets } = await fetchAndProcessProtocolAPRs();

  // 2) Persist assets and APR snapshots
  await persistAssets(compoundAssets, aaveAssets, sparkAssets);
  await persistAPRSnapshots(compound, aave, spark, compoundKeys);

  // 3) Load comparison alerts
  const alerts = await loadComparisonAlerts();

  // 4) Process each alert
  let totalSent = 0;

  for (const alert of alerts) {
    // Check if alert should be processed
    const { shouldProcess, previouslySent } = await shouldProcessAlert(alert);
    if (!shouldProcess) continue;

    // Evaluate conditions and create notification triggerValues
    const triggerValues = await evaluateConditions(alert, previouslySent);
    if (triggerValues.length === 0) continue;

    // Send notifications
    await sendNotifications(alert, triggerValues);

    // Log notification
    await logNotification(alert.id, triggerValues);

    totalSent++;
  }

  // 5) Return response
  return {
    success: true,
    triggeredNotifications: totalSent,
  };
}

export const GET = withErrorHandlingV2<CompareCompoundResponse>(compareCompoundHandler);
