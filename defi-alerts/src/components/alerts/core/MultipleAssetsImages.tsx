'use client';

import { utils } from 'ethers';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // If only one asset, render a single AssetImage
  if (assets.length === 1) {
    return <SingleAssetImage chain={assets[0].chain} assetAddress={assets[0].assetAddress} assetSymbol={assets[0].assetSymbol} />;
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
                <SingleAssetImage chain={asset.chain} assetAddress={asset.assetAddress} assetSymbol={asset.assetSymbol} />
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
                  <SingleAssetImage chain={asset.chain} assetAddress={asset.assetAddress} assetSymbol={asset.assetSymbol} />
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

// Internal component that reuses the AssetImage logic
function SingleAssetImage({ chain, assetAddress, assetSymbol }: { chain: string; assetAddress: string; assetSymbol: string }) {
  const [imageError, setImageError] = useState(false);
  const checksummed = useMemo(() => utils.getAddress(assetAddress.toLowerCase()), [assetAddress]);

  // Build primary TrustWallet URL
  const primaryUrl = useMemo(
    () => `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/assets/${checksummed}/logo.png`,
    [chain, checksummed]
  );

  const imageUrlToUse = useMemo(() => {
    const override = getOverrideUrl(chain, checksummed);
    return override === null ? primaryUrl : override;
  }, [chain, checksummed, primaryUrl]);

  if (imageError) {
    // Fallback to a colored div with the first letter of the token symbol
    return (
      <span
        className="inline-flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {assetSymbol.charAt(0)}
      </span>
    );
  }

  return <Image src={imageUrlToUse} alt={assetSymbol} width={20} height={20} onError={() => setImageError(true)} className="inline rounded-full" />;
}

function getOverrideUrl(chain: string, checksummed: string): string | null {
  const lcChain = chain.toLowerCase();
  const key = `${lcChain}-${checksummed}`;

  const overrides: Record<string, string> = {
    'ethereum-0xdAC17F958D2ee523a2206206994597C13D831ec7': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png`,
    'optimism-0x94b008aA00579c1307B0EF2c499aD98a8ce58e58': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png`,
    'polygon-0xc2132D05D31c914a87C6611C10748AEb04B58e8F': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png`,
    'optimism-0x4200000000000000000000000000000000000006': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'base-0x4200000000000000000000000000000000000006': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'arbitrum-0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'unichain-0x4200000000000000000000000000000000000006': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'unichain-0x078D782b760474a361dDA0AF3839290b0EF57AD6': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png`,
    'mantle-0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34': `/USDe.svg`,
  };

  return overrides[key] ?? null;
}
