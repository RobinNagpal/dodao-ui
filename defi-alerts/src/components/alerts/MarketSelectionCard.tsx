'use client';

import ChainSelection from '@/components/alerts/core/ChainSelection';
import MarketSelection from '@/components/alerts/core/MarketSelection';
import PlatformSelection from '@/components/alerts/core/PlatformSelection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <MarketSelection selectedMarkets={selectedMarkets} toggleMarket={toggleMarket} markets={markets} error={errors.markets} />
      </CardContent>
    </Card>
  );
}
