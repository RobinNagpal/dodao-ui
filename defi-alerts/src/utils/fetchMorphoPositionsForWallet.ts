// File: src/utils/morphoPositions.ts

import { MORPHO_CHAIN_IDS } from '@/shared/migrator/morpho/config';
import { COMPOUND_MARKETS, CHAINS } from '@/shared/web3/config';
import type { WalletComparisonPosition } from '@/components/modals/types';
import MorphoClient from '@/graphql/morpho/morpho-client';

// Import the generated GraphQL document (the same one used by useGetMorphoVaultPositionsQuery)
import {
  GetMorphoVaultPositionsDocument,
  GetMorphoVaultPositionsQuery,
  GetMorphoVaultPositionsQueryVariables,
} from '@/graphql/morpho/generated/generated-types';

/**
 * For a single wallet address, fetch Morpho positions across all chains in MORPHO_CHAIN_IDS,
 * and return a flat WalletComparisonPosition[] array. Identical logic as your hook did,
 * but now purely in Node/TS without React hooks.
 */
export async function fetchMorphoPositionsForWallet(wallet: string): Promise<WalletComparisonPosition[]> {
  const positions: WalletComparisonPosition[] = [];
  let supplyCount = 0;
  let borrowCount = 0;

  for (const chainId of MORPHO_CHAIN_IDS) {
    const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

    let data: GetMorphoVaultPositionsQuery | null = null;
    try {
      const result = await MorphoClient.query<GetMorphoVaultPositionsQuery, GetMorphoVaultPositionsQueryVariables>({
        query: GetMorphoVaultPositionsDocument,
        variables: {
          chainId,
          address: wallet,
        },
        fetchPolicy: 'no-cache',
      });
      data = result.data;
    } catch (err: any) {
      // If it’s the “no results” error, skip. Otherwise, log and skip as well.
      const isEmptyError = err.name === 'ApolloError' && typeof err.message === 'string' && err.message.includes('No results matching given parameters');
      if (!isEmptyError) {
        console.error(`Morpho query failed on chain ${chainId} for wallet ${wallet}:`, err);
      }
      continue;
    }

    const marketPositions = data.userByAddress?.marketPositions;
    if (!marketPositions?.length) {
      continue;
    }

    const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);

    for (const pos of marketPositions) {
      const { market, state } = pos;
      if (!state || !market.collateralAsset || !market.dailyApys) {
        continue;
      }

      const loanAddr = market.loanAsset.address.toLowerCase();
      const collateralAddr = market.collateralAsset.address.toLowerCase();

      const hasMatchingMarket = compoundForChain.some((m) => {
        if (m.baseAssetAddress.toLowerCase() !== loanAddr) return false;
        return m.collaterals.some((addr) => addr.toLowerCase() === collateralAddr);
      });

      const supply = BigInt(state.supplyAssets);
      const borrow = BigInt(state.borrowAssets);
      if (supply === BigInt(0) && borrow === BigInt(0)) {
        continue; // skip if neither
      }

      const action: 'SUPPLY' | 'BORROW' = supply > BigInt(0) ? 'SUPPLY' : 'BORROW';
      const idTag = action === 'SUPPLY' ? `supply-${++supplyCount}-morpho` : `borrow-${++borrowCount}-morpho`;
      const symbol = `(${market.loanAsset.symbol === 'WETH' ? 'ETH' : market.loanAsset.symbol} - ${market.collateralAsset.symbol})`;

      const apyEntry = market.dailyApys ?? {
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
  }

  return positions;
}
