import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';
import { AlertActionType, ConditionType, DeliveryChannelType, NotificationFrequency, SeverityLevel } from '@prisma/client';
import { prisma } from '@/prisma';

// Common interfaces for alert payloads
export interface BaseAlertCondition {
  type: ConditionType;
  severity: SeverityLevel;
  value?: string;
  min?: string;
  max?: string;
}

export interface BaseDeliveryChannel {
  type: DeliveryChannelType;
  email?: string;
  webhookUrl?: string;
}

// Validate required fields
export function validateRequiredFields(fields: Record<string, any>, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!fields[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Validate array fields
export function validateArrayFields(fields: Record<string, any>, arrayFields: string[]): void {
  for (const field of arrayFields) {
    if (!Array.isArray(fields[field]) || fields[field].length === 0) {
      throw new Error(`Missing required field: ${field} must be a non-empty array`);
    }
  }
}

// Validate conditions
export function validateConditions(conditions: BaseAlertCondition[]): void {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    throw new Error('Missing required field: conditions must be a non-empty array');
  }

  for (const c of conditions) {
    if (c.type === ConditionType.APR_OUTSIDE_RANGE) {
      // require both min & max
      if (!c.min || !c.max) {
        throw new Error('Both min and max thresholds are required for range conditions.');
      }
      if (isNaN(Number(c.min)) || isNaN(Number(c.max))) {
        throw new Error('Min and max thresholds must be valid numbers.');
      }
    } else {
      // single‐value conditions
      if (!c.value) {
        throw new Error('A threshold value is required for all other condition types.');
      }
      if (isNaN(Number(c.value))) {
        throw new Error('Threshold values must be valid numbers.');
      }
    }
  }
}

// Validate delivery channels
export function validateDeliveryChannels(deliveryChannels: BaseDeliveryChannel[]): void {
  if (!Array.isArray(deliveryChannels) || deliveryChannels.length === 0) {
    throw new Error('Missing required field: deliveryChannels must be a non-empty array');
  }

  for (const d of deliveryChannels) {
    if (d.type === DeliveryChannelType.EMAIL) {
      if (!d.email) {
        throw new Error('An email address is required for Email channels.');
      }
      // simple regex check
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(d.email)) {
        throw new Error(`Invalid email address: ${d.email}`);
      }
    } else if (d.type === DeliveryChannelType.WEBHOOK) {
      if (!d.webhookUrl) {
        throw new Error('A webhook URL is required for Webhook channels.');
      }
      try {
        new URL(d.webhookUrl);
      } catch {
        throw new Error(`Invalid webhook URL: ${d.webhookUrl}`);
      }
    }
  }
}

// Get user from database
export async function getUser(username: string, spaceId: string) {
  console.log('[AlertUtils] Looking up user in database', { username, spaceId });
  const user = await prisma.user.findUnique({ where: { username_spaceId: { username, spaceId } } });
  if (!user) {
    console.log('[AlertUtils] User not found in database', { username, spaceId });
    throw new Error('User not found');
  }
  console.log('[AlertUtils] User found successfully', { userId: user.id });
  return user;
}

// Map chain names to Prisma connect objects
export function mapChainsToPrismaConnect(selectedChains: string[]) {
  console.log('[AlertUtils] Mapping chain names to Prisma connect objects', { selectedChains });
  const chainConnect = selectedChains.map((chainName) => {
    const cfg = CHAINS.find((c) => c.name === chainName);
    if (!cfg) {
      console.log('[AlertUtils] Unsupported chain found', { chainName });
      throw new Error(`Unsupported chain: ${chainName}`);
    }
    return { chainId: cfg.chainId };
  });
  console.log('[AlertUtils] Chain mapping completed', { chainConnectCount: chainConnect.length });
  return chainConnect;
}

// Map markets to Prisma connect objects
export function mapMarketsToPrismaConnect(selectedChains: string[], selectedMarkets: string[]) {
  console.log('[AlertUtils] Building asset connect objects', { selectedChains, selectedMarkets });
  const assetConnect = selectedChains.flatMap((chainName) => {
    const chainCfg = CHAINS.find((c) => c.name === chainName)!;
    return selectedMarkets
      .map((uiSymbol) => {
        const symbol = uiSymbol === 'ETH' ? 'WETH' : uiSymbol;
        // find that market on this chain
        const m = COMPOUND_MARKETS.find((m) => m.symbol === symbol && m.chainId === chainCfg.chainId);
        if (!m) {
          // no valid market on this chain → skip
          console.log('[AlertUtils] No valid market found for chain and symbol', { chainName, symbol });
          return null;
        }
        // Prisma PK is "<chainId>_<baseAssetAddress>"
        return {
          chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}`,
        };
      })
      .filter((x): x is { chainId_address: string } => x !== null);
  });
  console.log('[AlertUtils] Asset connect objects built', { assetConnectCount: assetConnect.length });

  if (assetConnect.length === 0) {
    console.log('[AlertUtils] No valid markets found for chain+asset selections');
    throw new Error('No valid markets found for your chain+asset selections. Please choose a supported combination.');
  }

  return assetConnect;
}

// Map markets to Prisma connect objects using asset addresses instead of symbols
export function mapMarketsByAddressToPrismaConnect(selectedChains: string[], selectedMarkets: string[]) {
  console.log('[AlertUtils] Building asset connect objects by address', { selectedChains, selectedMarkets });
  const assetConnect = selectedChains.flatMap((chainName) => {
    const chainCfg = CHAINS.find((c) => c.name === chainName)!;
    return selectedMarkets
      .map((assetAddress) => {
        // Convert address to lowercase for comparison
        const normalizedAddress = assetAddress.toLowerCase();
        // find that market on this chain by comparing baseAssetAddress
        const m = COMPOUND_MARKETS.find((m) => m.baseAssetAddress.toLowerCase() === normalizedAddress && m.chainId === chainCfg.chainId);
        if (!m) {
          // no valid market on this chain → skip
          console.log('[AlertUtils] No valid market found for chain and address', { chainName, assetAddress });
          return null;
        }
        // Prisma PK is "<chainId>_<baseAssetAddress>"
        return {
          chainId_address: `${m.chainId}_${m.baseAssetAddress.toLowerCase()}`,
        };
      })
      .filter((x): x is { chainId_address: string } => x !== null);
  });
  console.log('[AlertUtils] Asset connect objects built by address', { assetConnectCount: assetConnect.length });

  if (assetConnect.length === 0) {
    console.log('[AlertUtils] No valid markets found for chain+asset address selections');
    throw new Error('No valid markets found for your chain+asset address selections. Please choose a supported combination.');
  }

  return assetConnect;
}
