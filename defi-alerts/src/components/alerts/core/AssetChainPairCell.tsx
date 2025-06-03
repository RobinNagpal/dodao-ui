import React from 'react';
import { COMPOUND_MARKETS } from '@/shared/web3/config';
import { ChainImage } from '@/components/alerts/core/ChainImage';
import { AssetImage } from '@/components/alerts/core/AssetImage';
import type { Asset, Chain } from '@/types/alerts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface AssetChainPairCellProps {
  chains: Chain[];
  assets: Asset[];
}

export default function AssetChainPairCell({ chains, assets }: AssetChainPairCellProps) {
  const chainToAssets: Record<string, { symbol: string; address: string }[]> = {};

  for (const chain of chains) {
    chainToAssets[chain.name] = [];
  }

  for (const asset of assets) {
    const assetAddrLC = asset.address.toLowerCase();

    for (const market of COMPOUND_MARKETS) {
      if (market.baseAssetAddress.toLowerCase() !== assetAddrLC) continue;

      const matchingChain = chains.find((c) => c.chainId === market.chainId);
      if (!matchingChain) continue;

      chainToAssets[matchingChain.name].push({
        symbol: asset.symbol === 'WETH' ? 'ETH' : asset.symbol,
        address: market.baseAssetAddress,
      });
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(chainToAssets).map(([chainName, assetList]) => {
        if (assetList.length === 0) {
          return null;
        }

        // Build a comma-separated list of React nodes, each “AssetImage + symbol”
        const assetItems = assetList.map((a, idx) => (
          <React.Fragment key={`${chainName}-${a.address}-${idx}`}>
            <AssetImage chain={chainName} assetAddress={a.address} assetSymbol={a.symbol} />
            {a.symbol}
          </React.Fragment>
        ));

        const hasMultipleAssets = assets.length > 1;

        return (
          <div key={chainName} className="p-2 flex items-center gap-2">
            <div className="flex items-center gap-1 ml-2 text-xs text-theme-primary">
              {assetItems[0]}
              {hasMultipleAssets ? '...' : ''}
            </div>
            <div className="flex items-center gap-1">
              -
              <ChainImage chain={chainName} />
              <span>{chainName}</span>
            </div>
            {hasMultipleAssets && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" className="h-5 w-5 p-0 hover-text-primary ml-2">
                      <Info size={14} />
                      <span className="sr-only">View all channels</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary-color">All Assets</h4>
                      <div className="flex items-center gap-1 ml-2 text-xs text-theme-primary">{assetItems}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      })}
    </div>
  );
}
