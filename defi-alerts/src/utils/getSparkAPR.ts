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
  const SYMBOL_BY_ASSET: Record<string, string> = COMPOUND_MARKETS.reduce((acc, m) => {
    // normalize to lowercase so lookups are case-insensitive
    acc[m.baseAssetAddress.toLowerCase()] = m.symbol;
    return acc;
  }, {} as Record<string, string>);

  return async () => {
    const chains = Object.keys(SPARK_DATA_PROVIDER).map((id) => Number(id));

    const perChainAprs = await Promise.all(
      chains.map(async (chainId) => {
        const provider = flattenProvider(SPARK_DATA_PROVIDER[chainId] ?? {});
        if (!provider) return [];

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

        const calls = collaterals.map((c) => ({
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

        // compute APR/APY for each filtered reserve
        const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

        return collaterals.map((c, i) => {
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
          const assetSymbol = SYMBOL_BY_ASSET[c.tokenAddress.toLowerCase()] ?? 'Unknown';

          return {
            chainId,
            chainName,
            asset: assetSymbol === 'WETH' ? 'ETH' : assetSymbol,
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
