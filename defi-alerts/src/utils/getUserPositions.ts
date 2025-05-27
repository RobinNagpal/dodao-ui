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
    // 1) grab all the APRs up front
    const aprs: CompoundMarketApr[] = await fetchAprs();

    const positions: WalletPosition[] = [];

    // 2) for each wallet, reset counts, then check every market
    await Promise.all(
      wallets.map(async (wallet) => {
        let supplyCount = 0;
        let borrowCount = 0;

        await Promise.all(
          MARKETS.map(async (market) => {
            // call userBasic
            const [user] = await multicall(config, {
              chainId: market.chainId,
              contracts: [
                {
                  address: market.cometAddress,
                  abi: CometABI,
                  functionName: 'userBasic',
                  args: [wallet as Address],
                },
              ] as const,
            }).then((r) =>
              r.map(
                (x) =>
                  x.result as [
                    bigint, // principal
                    bigint, // baseTrackingIndex
                    bigint, // baseTrackingAccrued
                    number, // assetsIn
                    number // _reserved
                  ]
              )
            );

            const [principal, , , assetsIn] = user;
            if (principal === BigInt(0) && assetsIn === 0) return;

            const actionType: 'SUPPLY' | 'BORROW' = principal > 0 ? 'SUPPLY' : 'BORROW';
            const aprObj = aprs.find((a) => a.chainId === market.chainId && a.asset === market.symbol);
            const rate = aprObj ? (actionType === 'SUPPLY' ? `${aprObj.netEarnAPY.toFixed(2)}%` : `${aprObj.netBorrowAPY.toFixed(2)}%`) : '0%';

            const chain = CHAINS.find((c) => c.chainId === market.chainId)?.name ?? 'Unknown';

            // 3) reset counts per wallet here
            const id = actionType === 'SUPPLY' ? `supply-${++supplyCount}` : `borrow-${++borrowCount}`;

            positions.push({
              id,
              walletAddress: wallet,
              chain,
              market: market.symbol === 'WETH' ? 'ETH' : market.symbol,
              rate,
              actionType,
              notificationFrequency: 'ONCE_PER_ALERT',
              conditions: [],
            });
          })
        );
      })
    );

    return positions;
  };
}
