import { AssetImage } from '@/components/alerts/core/AssetImage';
import { COMPOUND_MARKETS } from '@/shared/web3/config';
import { Asset, Chain } from '@/types/alerts';
import React from 'react';

interface AssetsCellProps {
  assets: Asset[];
  chains: Chain[];
}

/**
 * Component for displaying selected assets in a table cell
 */
const AssetsCell: React.FC<AssetsCellProps> = ({ assets, chains }) => {
  return (
    <div className="flex gap-1 mt-1 justify-center">
      {assets.map((asset) => {
        const market = COMPOUND_MARKETS.find((c) => c.baseAssetAddress.toLowerCase() === asset.address.toLowerCase());
        return (
          <div key={asset.chainId_address} className="text-xs text-theme-primary font-medium flex items-center gap-1">
            <AssetImage
              chain={chains.find((c) => c.chainId === asset.chainId)?.name || ''}
              assetAddress={market?.baseAssetAddress || asset.address}
              assetSymbol={asset.symbol === 'WETH' ? 'ETH' : asset.symbol}
            />
            {asset.symbol === 'WETH' ? 'ETH' : asset.symbol}
          </div>
        );
      })}
    </div>
  );
};

export default AssetsCell;
