import React from 'react';
import { COMPOUND_MARKETS } from '@/shared/web3/config';
import { ChainImage } from '@/components/alerts/core/ChainImage';
import { AssetImage } from '@/components/alerts/core/AssetImage';
import { MultipleAssetsImages } from '@/components/alerts/core/MultipleAssetsImages';
import type { Asset, Chain } from '@/types/alerts';

interface AssetChainPairCellProps {
  chains: Chain[];
  assets: Asset[];
}

export default function AssetChainPairCell({ chains, assets }: AssetChainPairCellProps) {
  const assetByAddress = new Map<string, { symbol: string; address: string }>();
  for (const a of assets) {
    assetByAddress.set(a.address.toLowerCase(), a);
  }
  const chainToAssets = COMPOUND_MARKETS.reduce((acc, m) => {
    const chain = chains.find((c) => c.chainId === m.chainId);
    if (!chain) return acc;

    const addressLC = m.baseAssetAddress.toLowerCase();
    const asset = assetByAddress.get(addressLC);
    if (!asset) return acc;

    acc[chain.name] = acc[chain.name] || [];
    if (!acc[chain.name].some((e) => e.address.toLowerCase() === addressLC)) {
      acc[chain.name].push({
        symbol: asset.symbol === 'WETH' ? 'ETH' : asset.symbol,
        address: asset.address,
      });
    }
    return acc;
  }, {} as Record<string, { symbol: string; address: string }[]>);

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(chainToAssets).map(([chainName, assetList]) => {
        if (assetList.length === 0) {
          return null;
        }

        const hasMultipleAssets = assetList.length > 1;

        // Convert assetList to the format expected by MultipleAssetsImages
        const multipleAssetsProps = assetList.map((a) => ({
          chain: chainName,
          assetAddress: a.address,
          assetSymbol: a.symbol,
        }));

        return (
          <div key={chainName} className="p-2 flex items-center gap-2">
            {hasMultipleAssets ? (
              <div className="ml-2">
                <MultipleAssetsImages assets={multipleAssetsProps} showTooltipIcon={false} />
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-2 text-xs text-theme-primary">
                <AssetImage chain={chainName} assetAddress={assetList[0].address} assetSymbol={assetList[0].symbol} />
                {assetList[0].symbol}
              </div>
            )}
            <div className="flex items-center gap-1">
              -
              <ChainImage chain={chainName} />
              <span>{chainName}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
