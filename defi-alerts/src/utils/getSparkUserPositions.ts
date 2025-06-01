import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { SPARK_DATA_PROVIDER } from '@/shared/migrator/spark/config';
import { Pool_Abi_DataProvider } from '@/shared/migrator/spark/abi/Pool_Abi_DataProvider';
import { useSparkAprs, MarketApr } from './getSparkAPR';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';
import { WalletComparisonPosition } from '@/components/modals/types';
import { useCallback } from 'react';

const symbolCache: Record<string, Promise<string> | undefined> = {};
async function fetchSymbol(chainName: string, tokenAddress: string): Promise<string> {
  if (chainName === 'Unknown') return 'Unknown';
  const chainNameLower = chainName.toLowerCase();
  const cacheKey = `${chainNameLower}:${tokenAddress}`;

  if (symbolCache[cacheKey]) {
    return symbolCache[cacheKey]!;
  }

  symbolCache[cacheKey] = (async () => {
    try {
      const url = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainNameLower}/assets/${tokenAddress}/info.json`;
      const response = await fetch(url);
      if (!response.ok) {
        return 'Unknown';
      }
      const infoJson = (await response.json()) as { symbol?: string };
      return infoJson.symbol ?? 'Unknown';
    } catch {
      return 'Unknown';
    }
  })();

  return symbolCache[cacheKey]!;
}

export function useSparkUserPositions(): (wallets: string[]) => Promise<WalletComparisonPosition[]> {
  const config: Config = useDefaultConfig;
  const fetchAprs = useSparkAprs();

  // helper to pick provider
  const flattenProvider = (addrOrObj: Address | Record<string, Address>): Address => (typeof addrOrObj === 'string' ? addrOrObj : Object.values(addrOrObj)[0]);

  return useCallback(
    async (wallets: string[]) => {
      const aprs: MarketApr[] = await fetchAprs();

      const aprsByChain = aprs.reduce<Record<number, MarketApr[]>>((acc, a) => {
        (acc[a.chainId] ||= []).push(a);
        return acc;
      }, {});

      const aprIndex: Record<number, Record<string, MarketApr>> = {};
      aprs.forEach((a) => {
        const key = a.assetAddress.toLowerCase();
        (aprIndex[a.chainId] ||= {})[key] = a;
      });

      const positions: WalletComparisonPosition[] = [];

      // 4) for each wallet, fetch all chains in parallel
      await Promise.all(
        wallets.map(async (wallet) => {
          let supplyCount = 0,
            borrowCount = 0;

          await Promise.all(
            Object.entries(aprsByChain).map(async ([chainIdStr, markets]) => {
              const chainId = Number(chainIdStr);
              const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

              const provider = flattenProvider(SPARK_DATA_PROVIDER[chainId] ?? {});
              if (!provider) return;

              // 5) batch getUserReserveData for each market
              const calls = markets.map((m) => ({
                address: provider,
                abi: Pool_Abi_DataProvider,
                functionName: 'getUserReserveData' as const,
                args: [m.assetAddress as Address, wallet as Address],
              }));

              // let raw: { result: any }[]
              let raw;
              try {
                raw = await multicall(config, {
                  chainId,
                  contracts: calls,
                });
              } catch (e) {
                console.error(`Spark getUserReserveData failed for ${wallet} @ chain ${chainId}`);
                return;
              }

              const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);

              // 6) parse & push only active positions
              for (let idx = 0; idx < raw.length; idx++) {
                const data = raw[idx].result as readonly [
                  bigint, // currentATokenBalance
                  bigint, // currentStableDebt
                  bigint, // currentVariableDebt
                  bigint, // principalStableDebt
                  bigint, // scaledVariableDebt
                  bigint, // stableBorrowRate
                  bigint, // liquidityRate
                  number, // stableRateLastUpdated
                  boolean // usageAsCollateralEnabled
                ];
                const [supBal, stDebt, varDebt] = data;
                const hasSupply = supBal > BigInt(0);
                const hasBorrow = stDebt + varDebt > BigInt(0);
                if (!hasSupply && !hasBorrow) return;

                const market = markets[idx];

                const hasMatchingMarket = compoundForChain.some((m) => m.baseAssetAddress.toLowerCase() === market.assetAddress.toLowerCase());
                const aprObj = aprIndex[chainId]?.[market.assetAddress.toLowerCase()];
                const actionType: 'SUPPLY' | 'BORROW' = hasSupply ? 'SUPPLY' : 'BORROW';
                const id = actionType === 'SUPPLY' ? `supply-${++supplyCount}-spark` : `borrow-${++borrowCount}-spark`;
                const rate = aprObj ? (actionType === 'SUPPLY' ? `${aprObj.netEarnAPY.toFixed(2)}%` : `${aprObj.netBorrowAPY.toFixed(2)}%`) : '0%';
                let assetSymbol = market.asset !== 'Unknown' ? market.asset : await fetchSymbol(chainName, market.assetAddress);

                positions.push({
                  id,
                  platform: 'SPARK',
                  walletAddress: wallet,
                  chain: chainName,
                  assetSymbol: assetSymbol,
                  assetAddress: market.assetAddress,
                  rate,
                  actionType,
                  disable: !hasMatchingMarket,
                  notificationFrequency: 'ONCE_PER_ALERT',
                  conditions: [
                    {
                      id: 'condition-1',
                      conditionType: 'APR_RISE_ABOVE',
                      severity: 'NONE',
                    },
                  ],
                });
              }
            })
          );
        })
      );

      return positions;
    },
    [config, fetchAprs]
  );
}
