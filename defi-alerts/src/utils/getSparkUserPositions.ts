import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { SPARK_DATA_PROVIDER } from '@/shared/migrator/spark/config';
import { Pool_Abi_DataProvider } from '@/shared/migrator/spark/abi/Pool_Abi_DataProvider';
import { useSparkAprs, MarketApr } from './getSparkAPR';
import { COMPOUND_MARKETS } from '@/shared/web3/config';
import { WalletComparisonPosition } from '@/components/modals/types';

export function useSparkUserPositions(): (wallets: string[]) => Promise<WalletComparisonPosition[]> {
  const config: Config = useDefaultConfig;
  const fetchAprs = useSparkAprs();

  // helper to pick provider
  const flattenProvider = (addrOrObj: Address | Record<string, Address>): Address => (typeof addrOrObj === 'string' ? addrOrObj : Object.values(addrOrObj)[0]);

  return async (wallets: string[]) => {
    // 1) fetch filtered Spark APRs
    const aprs: MarketApr[] = await fetchAprs();

    // 2) build allowed set per chain
    const allowed: Record<number, Set<string>> = {};
    COMPOUND_MARKETS.forEach((m) => {
      const s = (allowed[m.chainId] ??= new Set<string>());
      s.add(m.baseAssetAddress.toLowerCase());
    });

    // 3) filter APRs & group by chain
    const filteredAprs = aprs.filter((a) => allowed[a.chainId]?.has(a.assetAddress.toLowerCase()));
    const aprsByChain = filteredAprs.reduce<Record<number, MarketApr[]>>((acc, a) => {
      (acc[a.chainId] ||= []).push(a);
      return acc;
    }, {});

    const positions: WalletComparisonPosition[] = [];

    // 4) for each wallet, fetch all chains in parallel
    await Promise.all(
      wallets.map(async (wallet) => {
        let supplyCount = 0,
          borrowCount = 0;

        await Promise.all(
          Object.entries(aprsByChain).map(async ([chainIdStr, markets]) => {
            const chainId = Number(chainIdStr);
            const chainName = config.chains.find((c) => c.id === chainId)?.name ?? 'Unknown';

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

            // 6) parse & push only active positions
            raw.forEach((r, idx) => {
              const data = r.result as readonly [
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
              const aprObj = aprs.find((x) => x.chainId === chainId && x.assetAddress.toLowerCase() === market.assetAddress.toLowerCase());
              const actionType: 'SUPPLY' | 'BORROW' = hasSupply ? 'SUPPLY' : 'BORROW';

              const id = actionType === 'SUPPLY' ? `supply-${++supplyCount}-spark` : `borrow-${++borrowCount}-spark`;

              const rate = aprObj ? (actionType === 'SUPPLY' ? `${aprObj.netEarnAPY.toFixed(2)}%` : `${aprObj.netBorrowAPY.toFixed(2)}%`) : '0%';

              positions.push({
                id,
                platform: 'Spark',
                walletAddress: wallet,
                chain: chainName,
                market: market.asset === 'WETH' ? 'ETH' : market.asset,
                rate,
                actionType,
                notificationFrequency: 'ONCE_PER_ALERT',
                conditions: [
                  {
                    id: 'condition-1',
                    conditionType: 'APR_RISE_ABOVE',
                    severity: 'NONE',
                  },
                ],
              });
            });
          })
        );
      })
    );

    return positions;
  };
}
