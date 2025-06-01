import { AssetImage } from '@/components/alerts/core/AssetImage';
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
    <div className="flex flex-wrap gap-1 mt-1">
      {assets.map((asset) => (
        <span key={asset.chainId_address} className="text-xs text-theme-primary font-medium flex items-center gap-1">
          <AssetImage chain={chains.find((c) => c.chainId === asset.chainId)?.name || ''} assetAddress={asset.address} assetSymbol={asset.symbol} />
          {asset.symbol}
        </span>
      ))}
    </div>
  );
};

export default AssetsCell;
