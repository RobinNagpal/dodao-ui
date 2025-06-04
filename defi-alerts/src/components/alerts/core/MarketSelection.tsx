'use client';

import { AssetImage } from '@/components/alerts/core/AssetImage';
import { CHAINS, COMPOUND_MARKETS } from '@/shared/web3/config';
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface MarketSelectionProps {
  selectedMarkets: string[];
  toggleMarket: (market: string) => void;
  markets?: string[];
  error?: string;
  title?: string;
  description?: string;
}

/**
 * A reusable component for selecting multiple markets with checkboxes
 */
const MarketSelection: React.FC<MarketSelectionProps> = ({
  selectedMarkets,
  toggleMarket,
  markets = ['USDC', 'USDS', 'USDT', 'WETH', 'wstETH', 'USDe', 'USDC.e', 'USDbC', 'AERO'],
  error,
  title = 'Markets',
  description = 'Select one or more markets to monitor.',
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-md font-medium mb-1 text-theme-primary">{title}</h3>
      <p className="text-sm text-theme-muted mb-3">{description}</p>

      <div className="flex flex-wrap gap-3">
        {markets.map((m) => {
          const market = COMPOUND_MARKETS.find((c) => c.symbol.toLowerCase() === m.toLowerCase());
          const assetAddress = market?.baseAssetAddress;
          const chain = market && CHAINS.find((c) => c.chainId === market?.chainId);
          const isSel = selectedMarkets.includes(m);

          return (
            <div
              key={m}
              onClick={() => toggleMarket(m)}
              className={`rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors border ${isSel ? 'chip-selected' : 'border-theme-primary'} ${
                error ? 'border-red-500' : ''
              }`}
            >
              <div className="chip-checkbox w-4 h-4 rounded border mr-2 flex items-center justify-center">
                {isSel && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {assetAddress && chain && (
                <span className="mr-2">
                  <AssetImage chain={chain.name.toLowerCase()} assetAddress={assetAddress} assetSymbol={m} />
                </span>
              )}
              <span className="text-theme-primary chip-label">{m === 'WETH' ? 'ETH' : m}</span>
            </div>
          );
        })}
      </div>
      {error && (
        <div className="mt-2 flex items-center text-red-500 text-sm">
          <AlertCircle size={16} className="mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default MarketSelection;
