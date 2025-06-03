import type { WalletComparisonPosition } from '@/components/modals/types';
import { fetchMorphoPositionsForWallet } from './fetchMorphoPositionsForWallet';

export function useMorphoUserPositions(): (wallets: string[]) => Promise<WalletComparisonPosition[]> {
  return async (wallets) => {
    const allArrays = await Promise.all(
      wallets.map(async (wallet) => {
        return fetchMorphoPositionsForWallet(wallet);
      })
    );
    return allArrays.flat();
  };
}
