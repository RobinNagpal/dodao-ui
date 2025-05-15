import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';

import { useDefaultConfig } from '@/shared/web3/wagmiConfig';

import { AAVE_CONFIG_POOL_CONTRACT } from '@/shared/migrator/aave/config';
import { PoolDataAddressAbi_Arbitrum } from '@/shared/migrator/aave/abi/PoolDataAddressAbi_Arbitrum';

import { SPARK_DATA_PROVIDER } from '@/shared/migrator/spark/config';
import { Pool_Abi_DataProvider } from '@/shared/migrator/spark/abi/Pool_Abi_DataProvider';

import type { FlattenedAddresses, Collateral } from '@/shared/migrator/types';

import { calculateAaveAPY } from './calculateAaveAPR';
import { calculateAaveAPR } from './calculateAaveAPY';

export type MarketApr = {
  chainId: number;
  protocol: 'aave' | 'spark';
  asset: string;
  supplyAPY: number;
  variableBorrowAPY: number;
  stableBorrowAPY: number;
};

/**
 * Hook to fetch Aave & Spark market APR/APY values across supported chains.
 */
export function getAaveSparkAprs(): () => Promise<MarketApr[]> {
  const config: Config = useDefaultConfig;

  // Helper to flatten addresses mapping
  const getFlattenedAddresses = (addrs: FlattenedAddresses | Address): Address[] =>
    typeof addrs === 'object' ? (Object.values(addrs) as Address[]) : ([addrs] as Address[]);

  // Fetch APRs for a single protocol on a given chain
  const getProtocolAprs = async (chainId: number, protocol: 'aave' | 'spark'): Promise<MarketApr[]> => {
    // Determine provider address & ABI
    const providerAddress = protocol === 'aave' ? getFlattenedAddresses(AAVE_CONFIG_POOL_CONTRACT[chainId])[0] : SPARK_DATA_PROVIDER[chainId];
    const dataProviderAbi = protocol === 'aave' ? PoolDataAddressAbi_Arbitrum : Pool_Abi_DataProvider;

    if (!providerAddress) return [];

    // 1) fetch all reserves
    const [allReserves] = await multicall(config, {
      chainId,
      contracts: [
        {
          address: providerAddress,
          abi: dataProviderAbi,
          functionName: 'getAllReservesTokens',
        },
      ],
    });

    const collaterals = allReserves.result as Collateral[];
    if (!collaterals?.length) return [];

    // 2) fetch reserveData for each asset
    const reserveCalls = collaterals.map((c) => ({
      address: providerAddress,
      abi: dataProviderAbi,
      functionName: 'getReserveData',
      args: [c.tokenAddress],
    }));

    const reserveResults = await multicall(config, {
      chainId,
      contracts: reserveCalls,
    });

    // 3) compute APR/APY per asset
    const aprs: MarketApr[] = [];

    for (let i = 0; i < collaterals.length; i++) {
      const collateral = collaterals[i];
      const reserveData = reserveResults[i].result as any;

      const liquidityRate = reserveData[5].toString();
      const variableBorrowRate = reserveData[6].toString();
      const stableBorrowRate = reserveData[7].toString();

      const aprInfo = calculateAaveAPR({
        reserveDataArray: [
          {
            asset: collateral.tokenAddress as Address,
            liquidityRate,
            variableBorrowRate,
            stableBorrowRate,
          },
        ],
      })[0];
      const apyInfo = calculateAaveAPY([aprInfo])[0];

      aprs.push({
        chainId,
        protocol,
        asset: collateral.symbol,
        supplyAPY: parseFloat(apyInfo.supplyAPY),
        variableBorrowAPY: parseFloat(apyInfo.variableBorrowAPY),
        stableBorrowAPY: parseFloat(apyInfo.stableBorrowAPY),
      });
    }

    return aprs;
  };

  // Main entry: aggregate across chains and both protocols
  return async () => {
    const aaveChains = Object.keys(AAVE_CONFIG_POOL_CONTRACT).map((id) => Number(id));
    const sparkChains = Object.keys(SPARK_DATA_PROVIDER).map((id) => Number(id));

    const calls: Promise<MarketApr[]>[] = [];
    aaveChains.forEach((chainId) => calls.push(getProtocolAprs(chainId, 'aave')));
    sparkChains.forEach((chainId) => calls.push(getProtocolAprs(chainId, 'spark')));

    const results = await Promise.all(calls);
    return results.flat();
  };
}
