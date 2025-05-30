import { multicall, type Config } from '@wagmi/core';
import type { Address } from 'viem';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { AAVE_CONFIG_POOL_CONTRACT } from '@/shared/migrator/aave/config';
import { PoolDataAddressAbi_Arbitrum } from '@/shared/migrator/aave/abi/PoolDataAddressAbi_Arbitrum';
import { useAaveAprs, MarketApr } from './getAaveAPR';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';
import { WalletComparisonPosition } from '@/components/modals/types';

/** Helper to pick the first provider address from the config */
const flattenProvider = (addrOrObj: Address | Record<string, Address>): Address => (typeof addrOrObj === 'string' ? addrOrObj : Object.values(addrOrObj)[0]);

export function useAaveUserPositions(): (wallets: string[]) => Promise<WalletComparisonPosition[]> {
  const config: Config = useDefaultConfig;
  const fetchAprs = useAaveAprs();

  return async (wallets: string[]) => {
    // 1) get Aave APRs for every market
    const aprs: MarketApr[] = await fetchAprs();

    // 2) build a set of allowed assetAddresses per chain from your COMPOUND_MARKETS
    const allowedByChain: Record<number, Set<string>> = {};
    COMPOUND_MARKETS.forEach((m) => {
      const chainSet = (allowedByChain[m.chainId] ??= new Set<string>());
      chainSet.add(m.baseAssetAddress.toLowerCase());
    });

    // 3) filter APRs down to only those assets present in Compound
    const filteredAprs = aprs.filter((a) => allowedByChain[a.chainId]?.has(a.assetAddress.toLowerCase()));

    // 4) group the filtered APRs by chainId
    const aprsByChain = filteredAprs.reduce<Record<number, MarketApr[]>>((acc, apr) => {
      (acc[apr.chainId] ||= []).push(apr);
      return acc;
    }, {});

    const positions: WalletComparisonPosition[] = [];

    // 5) for each wallet, reset counters & fetch each chain in parallel
    await Promise.all(
      wallets.map(async (wallet) => {
        let supplyCount = 0;
        let borrowCount = 0;

        await Promise.all(
          Object.entries(aprsByChain).map(async ([chainIdStr, markets]) => {
            const chainId = Number(chainIdStr);
            const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

            // 6) find the Aave provider contract for this chain
            const providerAddr = flattenProvider(AAVE_CONFIG_POOL_CONTRACT[chainId] ?? {});
            if (!providerAddr) return;

            // 7) batch-multicall getUserReserveData for each filtered market
            const calls = markets.map((m) => ({
              address: providerAddr,
              abi: PoolDataAddressAbi_Arbitrum,
              functionName: 'getUserReserveData' as const,
              args: [m.assetAddress as Address, wallet as Address],
            }));

            let raw;
            try {
              raw = await multicall(config, {
                chainId,
                contracts: calls,
              });
            } catch (e) {
              console.error(`Aave userReserveData multicall failed for wallet ${wallet} on chain ${chainId}`, e);
              return;
            }

            // 8) parse and push positions only for active ones
            raw.forEach((r, idx) => {
              const userData = r.result as readonly [
                bigint, // currentATokenBalance
                bigint, // currentStableDebt
                bigint, // currentVariableDebt
                bigint, // liquidityRate
                bigint, // principalStableDebt
                bigint, // scaledVariableDebt
                bigint, // stableBorrowRate
                number, // stableRateLastUpdated
                boolean // usageAsCollateralEnabled
              ];
              const [supBal, stableDebt, varDebt] = userData;

              // skip if no supply & no borrow
              const hasSupply = supBal > BigInt(0);
              const hasBorrow = stableDebt + varDebt > BigInt(0);
              if (!hasSupply && !hasBorrow) return;

              const market = markets[idx];
              const aprObj = aprs.find((a) => a.chainId === chainId && a.assetAddress.toLowerCase() === market.assetAddress.toLowerCase());
              const actionType: 'SUPPLY' | 'BORROW' = hasSupply ? 'SUPPLY' : 'BORROW';

              const id = actionType === 'SUPPLY' ? `supply-${++supplyCount}-aave` : `borrow-${++borrowCount}-aave`;

              const rate = aprObj ? (actionType === 'SUPPLY' ? `${aprObj.netEarnAPY.toFixed(2)}%` : `${aprObj.netBorrowAPY.toFixed(2)}%`) : '0%';

              positions.push({
                id,
                platform: 'AAVE',
                walletAddress: wallet,
                chain: chainName,
                assetSymbol: market.asset === 'WETH' ? 'ETH' : market.asset,
                assetAddress: market.assetAddress,
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
