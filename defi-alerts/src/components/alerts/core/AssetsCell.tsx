import React, { useState } from 'react';
import Image from 'next/image';
import { Asset, Chain } from '@/types/alerts';

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

/**
 * Component for displaying asset images with fallback
 */
function AssetImage({ chain, assetAddress, assetSymbol }: { chain: string; assetAddress: string; assetSymbol: string }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/assets/${assetAddress}/logo.png`;

  if (imageError) {
    // Fallback to a colored div with the first letter of the token symbol
    return (
      <div
        className="flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {assetSymbol.charAt(0)}
      </div>
    );
  }

  return <Image src={imageUrl} alt={assetSymbol} width={20} height={20} onError={() => setImageError(true)} />;
}

export default AssetsCell;
