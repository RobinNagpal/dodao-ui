import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { AAVE_CONFIG_POOL_CONTRACT } from '@/shared/migrator/aave/config';
import { PoolDataAddressAbi_Arbitrum } from '@/shared/migrator/aave/abi/PoolDataAddressAbi_Arbitrum';
import type { FlattenedAddresses, Collateral } from '@/shared/migrator/types';
import { calculateAaveAPR } from './calculateAaveAPR';
import { calculateAaveAPY } from './calculateAaveAPY';
import { COMPOUND_MARKETS } from '@/shared/web3/config';

// ——— retry helper with exponential backoff ———
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function retry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const delay = baseDelay * 2 ** i;
      console.warn(`Aave multicall attempt ${i + 1} failed, retrying in ${delay}ms…`, err);
      await sleep(delay);
    }
  }
  // Final attempt
  return fn();
}

// your return type
export type MarketApr = {
  chainId: number;
  chainName: string;
  asset: string;
  assetAddress: string;
  netEarnAPY: number;
  netBorrowAPY: number;
};

/**
 * Hook to fetch Aave APR/APY values **only** for markets
 * that also exist in your Compound config.
 */
export function useAaveAprs(): () => Promise<MarketApr[]> {
  const config: Config = useDefaultConfig;

  // helper to normalize your provider addresses
  const flatten = (addrs: FlattenedAddresses | Address): Address[] => (typeof addrs === 'object' ? (Object.values(addrs) as Address[]) : [addrs]);

  const fetchChain = async (chainId: number): Promise<MarketApr[]> => {
    // 1) find the Aave pool address for this chain
    const [provider] = flatten(AAVE_CONFIG_POOL_CONTRACT[chainId] || []);
    if (!provider) return [];

    // 2) fetch all Aave reserves
    let collaterals: Collateral[];
    try {
      const [res] = await retry(() =>
        multicall(config, {
          chainId,
          contracts: [
            {
              address: provider,
              abi: PoolDataAddressAbi_Arbitrum,
              functionName: 'getAllReservesTokens',
            },
          ],
        })
      );
      collaterals = res.result as Collateral[];
    } catch {
      return [];
    }
    if (!collaterals.length) return [];

    // 3) limit to only those tokens also in COMPOUND_MARKETS
    const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);
    const compoundBaseSet = new Set(compoundForChain.map((m) => m.baseAssetAddress.toLowerCase()));

    const filtered = collaterals.filter((c) => compoundBaseSet.has(c.tokenAddress.toLowerCase()));
    if (!filtered.length) return [];

    // 4) batch-fetch reserve data for those filtered tokens
    const calls = filtered.map((c) => ({
      address: provider,
      abi: PoolDataAddressAbi_Arbitrum,
      functionName: 'getReserveData' as const,
      args: [c.tokenAddress],
    }));

    let results: (readonly [
      bigint, // unbacked
      bigint, // accruedToTreasuryScaled
      bigint, // totalAToken
      bigint, // totalStableDebt
      bigint, // totalVariableDebt
      bigint, // liquidityRate
      bigint, // variableBorrowRate
      bigint, // stableBorrowRate
      bigint, // averageStableBorrowRate
      bigint, // liquidityIndex
      bigint, // variableBorrowIndex
      number // lastUpdateTimestamp
    ])[];
    try {
      results = await retry(() => multicall(config, { chainId, contracts: calls, allowFailure: false }));
    } catch {
      return [];
    }

    // 5) map into your APR objects
    const chainName = config.chains.find((x) => x.id === chainId)?.name ?? 'Unknown';
    return filtered.map((c, i) => {
      const d = results[i];
      // compute Aave APR & APY
      const aprData = calculateAaveAPR({
        reserveDataArray: [
          {
            asset: c.tokenAddress as Address,
            liquidityRate: d[5].toString(),
            variableBorrowRate: d[6].toString(),
            stableBorrowRate: d[7].toString(),
          },
        ],
      })[0];
      const apyData = calculateAaveAPY([aprData])[0];

      return {
        chainId,
        chainName,
        asset: c.symbol,
        assetAddress: c.tokenAddress,
        netEarnAPY: parseFloat(apyData.supplyAPY),
        netBorrowAPY: parseFloat(apyData.variableBorrowAPY),
      };
    });
  };

  return async () => {
    // fetch each chain in parallel (with retries internally), then flatten
    const chains = Object.keys(AAVE_CONFIG_POOL_CONTRACT).map((id) => Number(id));
    const all = await Promise.all(chains.map((cid) => fetchChain(cid)));
    return all.flat();
  };
}
