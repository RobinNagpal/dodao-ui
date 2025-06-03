import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';

// Simple client-side validation for market combinations
export function validateMarketCombinations(
  selectedChains: string[],
  selectedMarkets: string[]
): {
  isValid: boolean;
} {
  if (selectedChains.length === 0 || selectedMarkets.length === 0) {
    return { isValid: false };
  }

  // Check if at least one combination exists
  for (const chainName of selectedChains) {
    const chainCfg = CHAINS.find((c) => c.name === chainName);
    if (!chainCfg) continue;

    for (const uiSymbol of selectedMarkets) {
      const symbol = uiSymbol === 'ETH' ? 'WETH' : uiSymbol;
      // Check if this market exists on this chain
      const market = COMPOUND_MARKETS.find((m) => m.symbol === symbol && m.chainId === chainCfg.chainId);
      if (market) {
        return { isValid: true }; // Found at least one valid combination
      }
    }
  }

  return { isValid: false };
}
