'use client';

import Image from 'next/image';
import React, { useState } from 'react';

/**
 * Component for displaying asset images with fallback
 */
export function ChainImage({ chain }: { chain: string }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/info/logo.png`;

  if (imageError) {
    console.log(`Got error loading image for chain. URL: ${imageUrl}`);
    // Fallback to a colored div with the first letter of the token symbol
    return (
      <div
        className="flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {chain.charAt(0)}
      </div>
    );
  }

  return <Image src={imageUrl} alt={chain} width={20} height={20} onError={() => setImageError(true)} />;
}
