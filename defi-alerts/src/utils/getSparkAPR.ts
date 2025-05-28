import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { SPARK_DATA_PROVIDER } from '@/shared/migrator/spark/config';
import { Pool_Abi_DataProvider } from '@/shared/migrator/spark/abi/Pool_Abi_DataProvider';
import type { Collateral } from '@/shared/migrator/types';
import { calculateAaveAPY } from './calculateAaveAPY';
import { calculateAaveAPR } from './calculateAaveAPR';

export type MarketApr = {
  chainId: number;
  chainName: string;
  asset: string;
  assetAddress: string;
  netEarnAPY: number;
  netBorrowAPY: number;
};

/**
 * Hook to fetch Spark market APR/APY values across supported chains.
 */
export function useSparkAprs(): () => Promise<MarketApr[]> {
  const config: Config = useDefaultConfig;

  const fetchChain = async (chainId: number): Promise<MarketApr[]> => {
    const provider = SPARK_DATA_PROVIDER[chainId];
    if (!provider) return [];

    const [all] = await multicall(config, {
      chainId,
      contracts: [
        {
          address: provider,
          abi: Pool_Abi_DataProvider,
          functionName: 'getAllReservesTokens',
        },
      ],
    });

    const collaterals = all.result as Collateral[];
    if (!collaterals.length) return [];

    const calls = collaterals.map((c) => ({
      address: provider,
      abi: Pool_Abi_DataProvider,
      functionName: 'getReserveData',
      args: [c.tokenAddress],
    }));

    const results = await multicall(config, { chainId, contracts: calls });

    return collaterals.map((c, i) => {
      const d = results[i].result as any;
      const apr = calculateAaveAPR({
        reserveDataArray: [
          {
            asset: c.symbol as Address,
            liquidityRate: d[5].toString(),
            variableBorrowRate: d[6].toString(),
            stableBorrowRate: d[7].toString(),
          },
        ],
      })[0];
      const apy = calculateAaveAPY([apr])[0];
      const chainName = config.chains.find((x) => x.id === chainId)?.name || 'Unknown';
      return {
        chainId,
        chainName,
        asset: c.symbol,
        assetAddress: c.tokenAddress,
        netEarnAPY: parseFloat(apy.supplyAPY),
        netBorrowAPY: parseFloat(apy.variableBorrowAPY),
      };
    });
  };

  return async () => {
    const chains = Object.keys(SPARK_DATA_PROVIDER).map((id) => Number(id));
    const res = await Promise.all(chains.map(fetchChain));
    return res.flat();
  };
}
