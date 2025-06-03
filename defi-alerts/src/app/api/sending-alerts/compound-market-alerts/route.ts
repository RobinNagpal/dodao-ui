import { prisma } from '@/prisma';
import { useCompoundMarketsAprs as getCompoundMarketsAprs } from '@/utils/getCompoundAPR';
import { sendAlertNotificationEmail } from '@/app/api/sending-alerts/send-alert-notification';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Alert, AlertActionType, DeliveryChannelType, NotificationFrequency } from '@prisma/client';
import { NextRequest } from 'next/server';

// Types
interface CompoundMarketResponse {
  success: boolean;
  triggeredNotifications: number;
}

interface MarketData {
  chainId: number;
  asset: string;
  assetAddress: string;
  netEarnAPY: number;
  netBorrowAPY: number;
}

interface NotificationGroup {
  chain: number;
  asset: string;
  currentRate: number;
  notificationFrequency: NotificationFrequency;
  conditions: Array<{
    type: string;
    threshold: number | { low: number; high: number };
    alertConditionId: string;
  }>;
}

interface NotificationPayload {
  alert: string;
  alertCategory: string;
  alertType: AlertActionType;
  walletAddress?: string | null;
  triggered: NotificationGroup[];
  timestamp: string;
}

// map frequency enum → milliseconds
const frequencyToMs: Record<NotificationFrequency, number> = {
  ONCE_PER_ALERT: 0,
  AT_MOST_ONCE_PER_3_HOURS: 3 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_6_HOURS: 6 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_12_HOURS: 12 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_DAY: 24 * 60 * 60 * 1000,
  AT_MOST_ONCE_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Fetches the latest Compound APRs
 */
async function fetchCompoundAPRs(): Promise<MarketData[]> {
  return getCompoundMarketsAprs()();
}

/**
 * Persists APR snapshots to the database
 */
async function persistAPRSnapshots(aprs: MarketData[]): Promise<void> {
  await prisma.lendingAndBorrowingRate.createMany({
    data: aprs.map((m) => ({
      protocolName: 'Compound',
      chainId: m.chainId,
      assetChainId_address: `${m.chainId}_${m.assetAddress.toLowerCase()}`,
      netEarnAPY: m.netEarnAPY,
      netBorrowAPY: m.netBorrowAPY,
    })),
  });
}

/**
 * Loads active, non-comparison alerts with their relations
 */
async function loadAlerts() {
  return prisma.alert.findMany({
    where: { isComparison: false, status: 'ACTIVE' },
    include: {
      selectedChains: true,
      selectedAssets: true,
      conditions: true,
      deliveryChannels: true,
    },
  });
}

/**
 * Gets previously sent condition IDs for an alert
 */
async function getPreviouslySentConditions(
  alert: Alert & {
    selectedChains: any[];
    selectedAssets: any[];
    conditions: any[];
    deliveryChannels: any[];
  }
): Promise<Set<string>> {
  const previouslySent = new Set<string>();
  if (alert.notificationFrequency === 'ONCE_PER_ALERT') {
    const past = await prisma.alertNotification.findMany({
      where: { alertId: alert.id },
      select: { alertConditionIds: true },
    });
    for (const pn of past) {
      pn.alertConditionIds.forEach((cid) => previouslySent.add(cid));
    }
  }
  return previouslySent;
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
  },
  groups: NotificationGroup[]
): Promise<boolean> {
  if (groups.length === 0) return false;

  if (alert.notificationFrequency !== 'ONCE_PER_ALERT') {
    const last = await prisma.sentNotification.findFirst({
      where: { alertNotification: { alertId: alert.id } },
      orderBy: { sentAt: 'desc' },
    });
    const elapsed = last ? Date.now() - last.sentAt.getTime() : Infinity;
    const window = frequencyToMs[alert.notificationFrequency];
    if (elapsed < window) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluates conditions for an alert and creates notification groups
 */
async function evaluateConditions(
  alert: Alert & {
    selectedChains: any[];
    selectedAssets: any[];
    conditions: any[];
    deliveryChannels: any[];
  },
  previouslySent: Set<string>
): Promise<{ hitIds: Set<string>; groups: NotificationGroup[] }> {
  const hitIds = new Set<string>();
  const groups: NotificationGroup[] = [];

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
      hits.forEach((c) => hitIds.add(c.id));

      // collect IDs and build payload
      groups.push({
        chain: chainName,
        asset: assetSym,
        currentRate: aprValue,
        notificationFrequency: alert.notificationFrequency,
        conditions: hits.map((c) => ({
          type: c.conditionType,
          threshold: c.conditionType === 'APR_OUTSIDE_RANGE' ? { low: c.thresholdValueLow!, high: c.thresholdValueHigh! } : c.thresholdValue!,
          alertConditionId: c.id,
        })),
      });
    }
  }

  return { hitIds, groups };
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
  groups: NotificationGroup[]
): Promise<void> {
  const payload: NotificationPayload = {
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
      try {
        await fetch(dest, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error(`Error sending webhook notification to ${dest}:`, error);
        await logError(
          'Error sending webhook notification in compound-market-alerts',
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
          'Error sending email notification in compound-market-alerts',
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
async function logNotification(alertId: string, hitIds: Set<string>, groups: NotificationGroup[]): Promise<void> {
  await prisma.alertNotification.create({
    data: {
      alertId: alertId,
      alertConditionIds: Array.from(hitIds),
      triggeredValues: groups,
      SentNotification: { create: {} },
    },
  });
}

/**
 * Main handler function for the API route
 */
async function compoundMarketAlertsHandler(request: NextRequest): Promise<CompoundMarketResponse> {
  // 1) Fetch the latest Compound APRs
  const aprs = await fetchCompoundAPRs();

  // 2) Persist the snapshot
  await persistAPRSnapshots(aprs);

  // 3) Load all active, non-comparison alerts *with* their relations
  const alerts = await loadAlerts();

  // 4) Process each alert
  let totalSent = 0;

  for (const alert of alerts) {
    // Get previously sent condition IDs
    const previouslySent = await getPreviouslySentConditions(alert);

    // Evaluate conditions and create notification groups
    const { hitIds, groups } = await evaluateConditions(alert, previouslySent);

    // Check if alert should be processed
    if (!(await shouldProcessAlert(alert, groups))) continue;

    // Send notifications
    await sendNotifications(alert, groups);

    // Log notification
    await logNotification(alert.id, hitIds, groups);

    totalSent++;
  }

  // 5) Return response
  return {
    success: true,
    triggeredNotifications: totalSent,
  };
}

export const GET = withErrorHandlingV2<CompoundMarketResponse>(compoundMarketAlertsHandler);
