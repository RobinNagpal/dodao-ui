import { MORPHO_CHAIN_IDS } from '@/shared/migrator/morpho/config';
import { COMPOUND_MARKETS, CHAINS } from '@/shared/web3/config';
import type { WalletComparisonPosition } from '@/components/modals/types';
import { useGetMorphoVaultPositionsQuery } from '@/graphql/morpho/generated/generated-types';
import MorphoClient from '@/graphql/morpho/morpho-client';

export function useMorphoUserPositions(): (wallets: string[]) => Promise<WalletComparisonPosition[]> {
  const { refetch } = useGetMorphoVaultPositionsQuery({
    client: MorphoClient,
    skip: true,
    fetchPolicy: 'no-cache',
  });
  return async (wallets) => {
    const positions: WalletComparisonPosition[] = [];

    // Loop each wallet
    for (const wallet of wallets) {
      let supplyCount = 0;
      let borrowCount = 0;

      await Promise.all(
        MORPHO_CHAIN_IDS.map(async (chainId) => {
          const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

          let data;
          try {
            data = await refetch({ chainId, address: wallet });
          } catch (err: any) {
            // If it's the "no results" error, just skip this chain
            if (err.name === 'ApolloError' && err.message.includes('No results matching given parameters')) {
              console.log(`Morpho empty on ${chainId} for ${wallet}, skipping`);
              return;
            }
            // Otherwise log and skip as well (or rethrow if you really want)
            console.error(`Morpho query failed on ${chainId}`, err);
            return;
          }

          if (!data.data?.userByAddress?.marketPositions?.length) return;

          const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);

          for (const pos of data.data.userByAddress.marketPositions) {
            const { market, state } = pos;
            if (!state || !market.collateralAsset || !market.dailyApys) continue;

            const loanAddr = market.loanAsset.address.toLowerCase();
            const collateralAddr = market.collateralAsset.address.toLowerCase();

            // Find the single Compound market where BOTH:
            //   • baseAssetAddress matches loanAddr, and
            //   • collateralAddr appears in that market's `collaterals` array.
            const hasMatchingMarket = compoundForChain.some((m) => {
              if (m.baseAssetAddress.toLowerCase() !== loanAddr) return false;
              return m.collaterals.some((addr) => addr.toLowerCase() === collateralAddr);
            });

            const supply = BigInt(state.supplyAssets);
            const borrow = BigInt(state.borrowAssets);
            if (supply === BigInt(0) && borrow === BigInt(0)) continue;

            const action: 'SUPPLY' | 'BORROW' = supply > BigInt(0) ? 'SUPPLY' : 'BORROW';
            const idTag = action === 'SUPPLY' ? `supply-${++supplyCount}-morpho` : `borrow-${++borrowCount}-morpho`;
            const symbol = `(${market.loanAsset.symbol} - ${market.collateralAsset.symbol})`;

            const apyEntry = market.dailyApys || {
              netSupplyApy: '0',
              netBorrowApy: '0',
            };
            const rate =
              action === 'SUPPLY'
                ? `${(parseFloat(apyEntry.netSupplyApy!.toString()) * 100).toFixed(2)}%`
                : `${(parseFloat(apyEntry.netBorrowApy!.toString()) * 100).toFixed(2)}%`;

            positions.push({
              id: idTag,
              platform: 'MORPHO',
              walletAddress: wallet,
              chain: chainName,
              assetSymbol: symbol,
              assetAddress: market.loanAsset.address,
              rate,
              actionType: action,
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
    }

    return positions;
  };
}
