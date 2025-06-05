import { MORPHO_CHAIN_IDS } from '@/shared/migrator/morpho/config';
import { COMPOUND_MARKETS, CHAINS } from '@/shared/web3/config';
import type { WalletComparisonPosition } from '@/components/modals/types';
import MorphoClient from '@/graphql/morpho/morpho-client';
import {
  GetMorphoVaultPositionsDocument,
  GetMorphoVaultPositionsQuery,
  GetMorphoVaultPositionsQueryVariables,
} from '@/graphql/morpho/generated/generated-types';

export async function fetchMorphoPositionsForWallet(wallet: string): Promise<WalletComparisonPosition[]> {
  const positions: WalletComparisonPosition[] = [];
  let supplyCount = 0;
  let borrowCount = 0;

  for (const chainId of MORPHO_CHAIN_IDS) {
    const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';

    // 1) run the new combined query (marketPositions + vaultPositions)
    let data: GetMorphoVaultPositionsQuery | null = null;
    try {
      const result = await MorphoClient.query<GetMorphoVaultPositionsQuery, GetMorphoVaultPositionsQueryVariables>({
        query: GetMorphoVaultPositionsDocument,
        variables: { chainId, address: wallet },
        fetchPolicy: 'no-cache',
      });
      data = result.data;
    } catch (err: any) {
      const isEmptyError = err.name === 'ApolloError' && typeof err.message === 'string' && err.message.includes('No results matching given parameters');
      if (!isEmptyError) {
        console.error(`Morpho query failed on chain ${chainId} for wallet ${wallet}:`, err);
      }
      continue;
    }

    // filter down to Compound‐supported markets on this chain
    const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);

    //
    // 2) BORROW SIDE ← use marketPositions[].state.borrowAssets + marketPositions[].market.*
    //
    const marketPositions = data.userByAddress?.marketPositions;
    if (marketPositions?.length) {
      for (const pos of marketPositions) {
        const { market, state } = pos;
        if (!state || !market || !market.loanAsset || !market.collateralAsset || !market.state) {
          continue;
        }

        const borrow = BigInt(state.borrowAssets);
        if (borrow === BigInt(0)) {
          // no borrow on this market
          continue;
        }

        // (a) check if this loan+collateral combo exists in Compound
        const loanAddr = market.loanAsset.address.toLowerCase();
        const collateralAddr = market.collateralAsset.address.toLowerCase();
        const hasMatchingMarket = compoundForChain.some((m) => {
          if (m.baseAssetAddress.toLowerCase() !== loanAddr) return false;
          return m.collaterals.some((addr) => addr.toLowerCase() === collateralAddr);
        });

        // (b) build idTag & symbol for borrow
        borrowCount += 1;
        const idTag = `borrow-morpho-${market.id}`;
        // symbol shows "LOAN − COLLATERAL"
        const symbol = `(${market.loanAsset.symbol === 'WETH' ? 'ETH' : market.loanAsset.symbol} - ${market.collateralAsset.symbol})`;

        // (c) pick netBorrowApy
        const apyEntry = market.state;
        const rate = `${(parseFloat(apyEntry.dailyNetBorrowApy!.toString()) * 100).toFixed(2)}%`;

        positions.push({
          id: idTag,
          platform: 'MORPHO',
          walletAddress: wallet,
          chain: chainName,
          assetSymbol: symbol,
          assetAddress: market.loanAsset.address,
          rate,
          actionType: 'BORROW',
          disable: !hasMatchingMarket,
          notificationFrequency: 'ONCE_PER_ALERT',
          conditions: [
            {
              id: '0-condition',
              conditionType: 'RATE_DIFF_BELOW',
              severity: 'NONE',
            },
          ],
        });
      }
    }

    //
    // 3) SUPPLY SIDE ← use vaultPositions[].state.assets + vaultPositions[].vault.*
    //
    const vaultPositions = data.userByAddress?.vaultPositions;
    if (vaultPositions?.length) {
      for (const vp of vaultPositions) {
        const { vault, state } = vp;
        if (!state || !vault || !vault.asset || !vault.state) {
          continue;
        }

        const supply = BigInt(state.assets);
        if (supply === BigInt(0)) {
          // no supply (assets = 0) in this vault
          continue;
        }

        // (a) check if this vaulted asset is supported by Compound
        const assetAddr = vault.asset.address.toLowerCase();
        const hasMatchingMarket = compoundForChain.some((m) => m.baseAssetAddress.toLowerCase() === assetAddr);

        // (b) build idTag & symbol for supply
        supplyCount += 1;
        const idTag = `supply-${supplyCount}-morpho`;
        // symbol is just the vault asset symbol (no collateral side here)
        const symbol = `(${vault.asset.symbol === 'WETH' ? 'ETH' : vault.asset.symbol} - ${vault.name})`;

        // (c) pick netApy from the vault's dailyApys
        const apyEntry = vault.state;
        const rate = `${(parseFloat(apyEntry.dailyNetApy!.toString()) * 100).toFixed(2)}%`;

        positions.push({
          id: idTag,
          platform: 'MORPHO',
          walletAddress: wallet,
          chain: chainName,
          assetSymbol: symbol,
          assetAddress: vault.asset.address,
          rate,
          actionType: 'SUPPLY',
          disable: !hasMatchingMarket,
          notificationFrequency: 'ONCE_PER_ALERT',
          conditions: [
            {
              id: '0-condition',
              conditionType: 'RATE_DIFF_ABOVE',
              severity: 'NONE',
            },
          ],
        });
      }
    }
  }

  return positions;
}
