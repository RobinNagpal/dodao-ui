'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssetImage } from './AssetImage';

interface Asset {
  chain: string;
  assetAddress: string;
  assetSymbol: string;
}

interface MultipleAssetsImagesProps {
  assets: Asset[];
  showTooltipIcon?: boolean;
}

/**
 * Component for displaying multiple asset images with overlap and tooltip
 */
export function MultipleAssetsImages({ assets, showTooltipIcon = false }: MultipleAssetsImagesProps) {
  if (!assets || assets.length === 0) {
    return null;
  }

  // For multiple assets, render overlapping images with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center relative">
            {assets.map((asset, index) => (
              <div
                key={`${asset.chain}-${asset.assetAddress}-${index}`}
                className="relative"
                style={{
                  marginLeft: index > 0 ? '-5px' : '0',
                  zIndex: assets.length - index,
                }}
              >
                <AssetImage chain={asset.chain} assetAddress={asset.assetAddress} assetSymbol={asset.assetSymbol} />
              </div>
            ))}
            {showTooltipIcon && (
              <Button size="icon" className="h-5 w-5 p-0 hover-text-primary ml-2">
                <Info size={14} />
                <span className="sr-only">View all assets</span>
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-block p-3 border border-theme-primary">
          <div className="space-y-2">
            <h4 className="font-medium text-primary-color">All Assets</h4>
            <div className="flex flex-wrap gap-2">
              {assets.map((asset, index) => (
                <div key={`tooltip-${asset.chain}-${asset.assetAddress}-${index}`} className="flex items-center gap-1">
                  <AssetImage chain={asset.chain} assetAddress={asset.assetAddress} assetSymbol={asset.assetSymbol} />
                  <span className="text-xs">{asset.assetSymbol}</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
