// src/shared/web3/hooks/useCompoundUserPositions.ts
import { multicall } from '@wagmi/core';
import type { Config } from '@wagmi/core';
import { CometABI } from '@/shared/web3/abi/CometABI';
import { MARKETS, CHAINS } from '@/shared/web3/config';
import { useDefaultConfig } from '@/shared/web3/wagmiConfig';
import { useCompoundMarketsAprs, CompoundMarketApr } from './getCompoundAPR';
import { Address } from 'viem';
import { WalletPosition } from '@/components/alerts/CreateAlertModals';

export function useCompoundUserPositions(): (wallets: string[]) => Promise<WalletPosition[]> {
  const config: Config = useDefaultConfig;
  const fetchAprs = useCompoundMarketsAprs();

  return async (wallets: string[]) => {
    const aprs: CompoundMarketApr[] = await fetchAprs();
    const positions: WalletPosition[] = [];

    await Promise.all(
      wallets.map(async (wallet) => {
        let supplyCount = 0;
        let borrowCount = 0;

        // 3) Group your MARKETS by chainId
        const marketsByChain = MARKETS.reduce<Record<number, typeof MARKETS>>((acc, m) => {
          (acc[m.chainId] ||= []).push(m);
          return acc;
        }, {});

        // 4) For each chain, do one multicall for all its markets
        await Promise.all(
          Object.entries(marketsByChain).map(async ([chainIdStr, markets]) => {
            const chainId = Number(chainIdStr);

            // build one contracts[] for this wallet+chain
            const contracts = markets.map(
              (market) =>
                ({
                  address: market.cometAddress,
                  abi: CometABI,
                  functionName: 'userBasic',
                  args: [wallet as Address],
                } as const)
            );

            let rawResults;
            try {
              rawResults = await multicall(config, { chainId, contracts });
            } catch (err) {
              console.error(`userBasic multicall failed for wallet ${wallet} on chain ${chainId}`, err);
              return;
            }

            // 5) Walk through each result in the order of markets[]
            rawResults.forEach((res, idx) => {
              const [principal, , , assetsIn] = res.result as [bigint, bigint, bigint, number, number];
              if (principal === BigInt(0) && assetsIn === 0) return;

              const market = markets[idx];
              const actionType: 'SUPPLY' | 'BORROW' = principal > 0 ? 'SUPPLY' : 'BORROW';
              const id = actionType === 'SUPPLY' ? `supply-${++supplyCount}` : `borrow-${++borrowCount}`;

              const aprObj = aprs.find((a) => a.chainId === chainId && a.asset === market.symbol);
              const rate = aprObj ? (actionType === 'SUPPLY' ? `${aprObj.netEarnAPY.toFixed(2)}%` : `${aprObj.netBorrowAPY.toFixed(2)}%`) : '0%';

              const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

              positions.push({
                id,
                walletAddress: wallet,
                chain: chainName,
                market: market.symbol === 'WETH' ? 'ETH' : market.symbol,
                rate,
                actionType,
                notificationFrequency: 'ONCE_PER_ALERT',
                conditions: [],
              });
            });
          })
        );
      })
    );

    return positions;
  };
}
