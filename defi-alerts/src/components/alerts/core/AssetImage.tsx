'use client';

import { utils } from 'ethers';
import Image from 'next/image';
import React, { useState } from 'react';

/**
 * Component for displaying asset images with fallback
 */
export function AssetImage({ chain, assetAddress, assetSymbol }: { chain: string; assetAddress: string; assetSymbol: string }) {
  const [imageError, setImageError] = useState(false);
  const checkSummedAddress = utils.getAddress(assetAddress.toLowerCase());
  const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/assets/${checkSummedAddress}/logo.png`;

  if (imageError) {
    console.log(`Got error loading image for ${assetSymbol} on ${chain} chain with address ${assetAddress}. URL: ${imageUrl}`);
    // Fallback to a colored div with the first letter of the token symbol
    return (
      <span
        className="flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {assetSymbol.charAt(0)}
      </span>
    );
  }

  return <Image src={imageUrl} alt={assetSymbol} width={20} height={20} onError={() => setImageError(true)} className="inline" />;
}
