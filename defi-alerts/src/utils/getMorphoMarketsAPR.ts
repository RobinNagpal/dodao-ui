import { COMPOUND_MARKETS, CHAINS } from '@/shared/web3/config';
import MorphoClient from '@/graphql/morpho/morpho-client';
import { GetMorphoMarketsDocument, GetMorphoMarketsQuery, GetMorphoMarketsQueryVariables } from '@/graphql/morpho/generated/generated-types';

export type MorphoMarketApr = {
  chainId: number;
  chainName: string;
  asset: string; // Loan asset symbol
  assetAddress: string; // Loan asset address
  collateralAsset: string; // Collateral asset symbol
  collateralAddress: string; // Collateral asset address
  marketId: string; // uniqueKey for generating links
  vaultName: string; // Combined name like "USDC - wstETH"
  netEarnAPY: number; // Will be 0 for markets (borrow only)
  netBorrowAPY: number;
};

export function useMorphoMarketsAprs(): () => Promise<MorphoMarketApr[]> {
  const SYMBOL_BY_ASSET: Record<string, string> = COMPOUND_MARKETS.reduce((acc, m) => {
    acc[m.baseAssetAddress.toLowerCase()] = m.symbol;
    return acc;
  }, {} as Record<string, string>);

  return async () => {
    const allMarkets: MorphoMarketApr[] = [];

    try {
      const result = await MorphoClient.query<GetMorphoMarketsQuery, GetMorphoMarketsQueryVariables>({
        query: GetMorphoMarketsDocument,
        variables: {
          first: 1000, // Fetch up to 1000 markets
        },
        fetchPolicy: 'no-cache',
      });

      const markets = result.data?.markets?.items || [];

      for (const market of markets) {
        if (
          !market.loanAsset?.address ||
          !market.collateralAsset?.address ||
          !market.state?.dailyNetBorrowApy ||
          !market.oracle?.chain?.id ||
          !market.uniqueKey
        ) {
          continue;
        }

        const chainId = market.oracle.chain.id;
        const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

        // Filter markets to only include loan assets that exist in Compound markets on the same chain
        const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);

        const loanAssetAddress = market.loanAsset.address.toLowerCase();
        const collateralAssetAddress = market.collateralAsset.address.toLowerCase();

        // Check if loan asset exists in Compound markets
        const hasMatchingLoanAsset = compoundForChain.some((m) => m.baseAssetAddress.toLowerCase() === loanAssetAddress);

        // Only include if loan asset exists in Compound markets
        if (!hasMatchingLoanAsset) {
          continue;
        }

        const loanAssetSymbol = SYMBOL_BY_ASSET[loanAssetAddress] ?? 'Unknown';

        // Skip Unknown loan assets
        if (loanAssetSymbol === 'Unknown') {
          continue;
        }

        // Get collateral asset symbol, fallback to the symbol from market data
        const collateralAssetSymbol = SYMBOL_BY_ASSET[collateralAssetAddress] ?? market.collateralAsset.symbol;

        allMarkets.push({
          chainId,
          chainName,
          asset: loanAssetSymbol === 'WETH' ? 'ETH' : loanAssetSymbol,
          assetAddress: market.loanAsset.address,
          collateralAsset: collateralAssetSymbol === 'WETH' ? 'ETH' : collateralAssetSymbol,
          collateralAddress: market.collateralAsset.address,
          marketId: market.uniqueKey,
          vaultName: `${loanAssetSymbol === 'WETH' ? 'ETH' : loanAssetSymbol} - ${collateralAssetSymbol === 'WETH' ? 'ETH' : collateralAssetSymbol}`,
          netEarnAPY: 0, // Morpho markets are borrow-only
          netBorrowAPY: parseFloat((market.state.dailyNetBorrowApy * 100).toFixed(2)),
        });
      }
    } catch (err: any) {
      const isEmptyError = err.name === 'ApolloError' && typeof err.message === 'string' && err.message.includes('No results matching given parameters');

      if (!isEmptyError) {
        console.error('Morpho markets query failed:', err);
      }
    }

    return allMarkets;
  };
}
