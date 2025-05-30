import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { SPARK_DATA_PROVIDER } from '@/shared/migrator/spark/config';
import { Pool_Abi_DataProvider } from '@/shared/migrator/spark/abi/Pool_Abi_DataProvider';
import type { Collateral } from '@/shared/migrator/types';
import { calculateAaveAPR } from './calculateAaveAPR';
import { calculateAaveAPY } from './calculateAaveAPY';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';

// — retry helper with exponential backoff —
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
async function retry<T>(fn: () => Promise<T>, retries = 3, baseDelay = 500): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const delay = baseDelay * 2 ** i;
      console.warn(`Spark multicall attempt ${i + 1} failed, retrying in ${delay}ms…`, err);
      await sleep(delay);
    }
  }
  // final try
  return fn();
}

export type MarketApr = {
  chainId: number;
  chainName: string;
  asset: string;
  assetAddress: string;
  netEarnAPY: number;
  netBorrowAPY: number;
};

/**
 * Fetch Spark APRs only for markets also in your Compound config.
 */
export function useSparkAprs(): () => Promise<MarketApr[]> {
  const config: Config = useDefaultConfig;

  // pick the provider address (might be string or object)
  const flattenProvider = (addrOrObj: Address | Record<string, Address>): Address => (typeof addrOrObj === 'string' ? addrOrObj : Object.values(addrOrObj)[0]);

  return async () => {
    const chains = Object.keys(SPARK_DATA_PROVIDER).map((id) => Number(id));

    const perChainAprs = await Promise.all(
      chains.map(async (chainId) => {
        const provider = flattenProvider(SPARK_DATA_PROVIDER[chainId] ?? {});
        if (!provider) return [];

        // 1) get all Spark reserves
        let collaterals: Collateral[];
        try {
          const [res] = await retry(() =>
            multicall(config, {
              chainId,
              contracts: [
                {
                  address: provider,
                  abi: Pool_Abi_DataProvider,
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

        // 2) filter to only those in COMPOUND_MARKETS
        const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);
        const compoundSet = new Set(compoundForChain.map((m) => m.baseAssetAddress.toLowerCase()));
        const filtered = collaterals.filter((c) => compoundSet.has(c.tokenAddress.toLowerCase()));
        if (!filtered.length) return [];

        // 3) batch-fetch reserve data
        const calls = filtered.map((c) => ({
          address: provider,
          abi: Pool_Abi_DataProvider,
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

        // 4) compute APR/APY for each filtered reserve
        const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

        return filtered.map((c, i) => {
          const d = results[i];
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
      })
    );

    return perChainAprs.flat();
  };
}
