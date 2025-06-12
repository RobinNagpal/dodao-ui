import { MORPHO_CHAIN_IDS } from '@/shared/migrator/morpho/config';
import { COMPOUND_MARKETS, CHAINS } from '@/shared/web3/config';
import MorphoClient from '@/graphql/morpho/morpho-client';
import {
  GetMorphoVaultsDocument,
  GetMorphoVaultsQuery,
  GetMorphoVaultsQueryVariables,
} from '@/graphql/morpho/generated/generated-types';

export type MorphoVaultApr = {
  chainId: number;
  chainName: string;
  asset: string;
  assetAddress: string;
  vaultAddress: string;
  vaultName: string;
  vaultSymbol: string;
  netEarnAPY: number;
  netBorrowAPY: number; // For consistency with other platforms (will be 0 for vaults)
};

export function useMorphoVaultsAprs(): () => Promise<MorphoVaultApr[]> {
  const SYMBOL_BY_ASSET: Record<string, string> = COMPOUND_MARKETS.reduce((acc, m) => {
    acc[m.baseAssetAddress.toLowerCase()] = m.symbol;
    return acc;
  }, {} as Record<string, string>);

  return async () => {
    const allVaults: MorphoVaultApr[] = [];

    for (const chainId of MORPHO_CHAIN_IDS) {
      const chainName = CHAINS.find((c) => c.chainId === chainId)?.name ?? 'Unknown';
      
      try {
        const result = await MorphoClient.query<GetMorphoVaultsQuery, GetMorphoVaultsQueryVariables>({
          query: GetMorphoVaultsDocument,
          variables: {
            where: {
              chainId_in: [chainId], // Pass as array since GraphQL expects number[]
              whitelisted: true,
            },
            first: 150, // Fetch up to 150 vaults per chain
          },
          fetchPolicy: 'no-cache',
        });

        const vaults = result.data?.vaults?.items || [];
        
        // Filter vaults to only include assets that exist in Compound markets on the same chain
        const compoundForChain = COMPOUND_MARKETS.filter((m) => m.chainId === chainId);
        
        for (const vault of vaults) {
          if (!vault.asset?.address || !vault.state?.dailyNetApy || !vault.address) {
            continue;
          }

          const assetAddress = vault.asset.address.toLowerCase();
          const hasMatchingMarket = compoundForChain.some(
            (m) => m.baseAssetAddress.toLowerCase() === assetAddress
          );

          // Only include if asset exists in Compound markets
          if (!hasMatchingMarket) {
            continue;
          }

          const assetSymbol = SYMBOL_BY_ASSET[assetAddress] ?? 'Unknown';
          
          // Skip Unknown assets
          if (assetSymbol === 'Unknown') {
            continue;
          }

          allVaults.push({
            chainId,
            chainName,
            asset: assetSymbol === 'WETH' ? 'ETH' : assetSymbol,
            assetAddress: vault.asset.address,
            vaultAddress: vault.address,
            vaultName: vault.name || '',
            vaultSymbol: vault.symbol || '',
            netEarnAPY: parseFloat((vault.state.dailyNetApy * 100).toFixed(2)),
            netBorrowAPY: 0, // Morpho vaults are supply-only
          });
        }
      } catch (err: any) {
        const isEmptyError = err.name === 'ApolloError' && 
          typeof err.message === 'string' && 
          err.message.includes('No results matching given parameters');
        
        if (!isEmptyError) {
          console.error(`Morpho vaults query failed on chain ${chainId}:`, err);
        }
        // Continue to next chain even if this one fails
        continue;
      }
    }

    return allVaults;
  };
} 