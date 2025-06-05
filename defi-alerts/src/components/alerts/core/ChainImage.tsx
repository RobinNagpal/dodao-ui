'use client';

import Image from 'next/image';
import React, { useState } from 'react';

/**
 * Component for displaying asset images with fallback
 */
export function ChainImage({ chain }: { chain: string }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/info/logo.png`;

  if (chain.toLowerCase() === 'unichain') {
    return (
      <span className="flex items-center justify-center bg-white rounded-full p-1" style={{ width: '20px', height: '20px' }}>
        <svg viewBox="0 0 116 115" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M115.476 56.406C84.3089 56.406 59.07 31.1416 59.07 0H56.8819V56.406H0.47583V58.594C31.6429 58.594 56.8819 83.8584 56.8819 115H59.07V58.594H115.476V56.406Z"
            fill="#fc0fa4"
          />
        </svg>
      </span>
    );
  }

  if (imageError) {
    console.log(`Got error loading image for chain. URL: ${imageUrl}`);
    // Fallback to a colored div with the first letter of the token symbol
    return (
      <span
        className="flex items-center justify-center bg-white text-black rounded-full font-semibold"
        style={{ width: '20px', height: '20px', fontSize: '12px' }}
      >
        {chain.charAt(0)}
      </span>
    );
  }

  return <Image src={imageUrl} alt={chain} width={20} height={20} onError={() => setImageError(true)} className="inline" />;
}
