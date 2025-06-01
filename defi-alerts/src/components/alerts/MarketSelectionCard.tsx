'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import ChainSelection from '@/components/alerts/core/ChainSelection';
import PlatformSelection from '@/components/alerts/core/PlatformSelection';

interface MarketSelectionCardProps {
  selectedChains: string[];
  toggleChain: (chain: string) => void;
  selectedMarkets: string[];
  toggleMarket: (market: string) => void;
  selectedPlatforms?: string[];
  togglePlatform?: (platform: string) => void;
  errors: {
    chains?: string;
    markets?: string;
    platforms?: string;
  };
  showPlatforms?: boolean;
  title?: string;
  description?: string;
}

export default function MarketSelectionCard({
  selectedChains,
  toggleChain,
  selectedMarkets,
  toggleMarket,
  selectedPlatforms = [],
  togglePlatform,
  errors,
  showPlatforms = false,
  title = 'Market Selection',
  description = 'Select the chains and markets you want to monitor.',
}: MarketSelectionCardProps) {
  const chains = ['Ethereum', 'Optimism', 'Arbitrum', 'Polygon', 'Base', 'Unichain', 'Ronin', 'Mantle', 'Scroll'];
  const markets = ['USDC', 'USDS', 'USDT', 'ETH', 'wstETH', 'USDe', 'USDC.e', 'USDbC', 'AERO'];
  const platforms = ['Aave', 'Morpho', 'Spark'];

  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg text-theme-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">{description}</p>

        {showPlatforms && togglePlatform && (
          <PlatformSelection selectedPlatforms={selectedPlatforms} togglePlatform={togglePlatform} platforms={platforms} error={errors.platforms} />
        )}

        {/* Chains */}
        <ChainSelection selectedChains={selectedChains} toggleChain={toggleChain} chains={chains} error={errors.chains} />

        {/* Markets */}
        <div>
          <h3 className="text-md font-medium mb-1 text-theme-primary">Markets</h3>
          <p className="text-sm text-theme-muted mb-3">Select one or more markets to monitor.</p>

          <div className="flex flex-wrap gap-3">
            {markets.map((m) => {
              const isSel = selectedMarkets.includes(m);

              return (
                <div
                  key={m}
                  onClick={() => toggleMarket(m)}
                  className={`rounded-md px-3 py-2 flex items-center cursor-pointer transition-colors border ${
                    isSel ? 'chip-selected' : 'border-theme-primary'
                  } ${errors.markets ? 'border-red-500' : ''}`}
                >
                  <div className="chip-checkbox w-4 h-4 rounded border mr-2 flex items-center justify-center">
                    {isSel && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <span className="text-theme-primary chip-label">{m}</span>
                </div>
              );
            })}
          </div>
          {errors.markets && (
            <div className="mt-2 flex items-center text-red-500 text-sm">
              <AlertCircle size={16} className="mr-1" />
              <span>{errors.markets}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
