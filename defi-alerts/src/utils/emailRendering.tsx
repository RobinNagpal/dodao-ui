import { getAddress } from 'ethers';
import React from 'react';

/**
 * Utility functions for rendering React components for emails
 */

/**
 * React component for asset image
 */
export function AssetImageEmail({ chain, assetAddress, assetSymbol }: { chain: string; assetAddress: string; assetSymbol: string }): JSX.Element {
  try {
    const checksummed = getAddress(assetAddress.toLowerCase());

    // Build primary TrustWallet URL
    const primaryUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/assets/${checksummed}/logo.png`;

    // Check for override URL
    const override = getOverrideUrl(chain, checksummed);
    const imageUrlToUse = override === null ? primaryUrl : override;

    return <img src={imageUrlToUse} alt={assetSymbol} width="20" height="20" style={{ display: 'inline', verticalAlign: 'middle' }} />;
  } catch (error) {
    // Fallback to a colored div with the first letter of the token symbol
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: '50%',
          fontWeight: 600,
          width: '20px',
          height: '20px',
          fontSize: '12px',
          verticalAlign: 'middle',
        }}
      >
        {assetSymbol.charAt(0)}
      </span>
    );
  }
}

/**
 * React component for chain image
 */
export function ChainImageEmail({ chain }: { chain: string }): JSX.Element {
  const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/info/logo.png`;

  if (chain.toLowerCase() === 'unichain') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          padding: '1px',
          width: '20px',
          height: '20px',
          verticalAlign: 'middle',
        }}
      >
        <svg viewBox="0 0 116 115" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
          <path
            d="M115.476 56.406C84.3089 56.406 59.07 31.1416 59.07 0H56.8819V56.406H0.47583V58.594C31.6429 58.594 56.8819 83.8584 56.8819 115H59.07V58.594H115.476V56.406Z"
            fill="#fc0fa4"
          />
        </svg>
      </span>
    );
  }

  // For server-side rendering, we can't use onError
  // Instead, we'll use a simple img tag and rely on server-side rendering
  return <img src={imageUrl} alt={chain} width="20" height="20" style={{ display: 'inline', verticalAlign: 'middle' }} />;
}

/**
 * React component for platform image
 */
export function PlatformImageEmail({ platform }: { platform: string }): JSX.Element {
  // For email, we need to use absolute URLs
  const imageUrl = `https://www.defialerts.xyz/${platform.toLowerCase()}.png`;

  // For server-side rendering, we can't use onError
  // Instead, we'll use a simple img tag and rely on server-side rendering
  return <img src={imageUrl} alt={`${platform}`} width="20" height="20" style={{ display: 'inline', verticalAlign: 'middle' }} />;
}

/**
 * Helper function to get override URL for asset images
 */
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
    'mantle-0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34': `https://defi-alerts.dodao.io/USDe.svg`,
  };

  return overrides[key] ?? null;
}
