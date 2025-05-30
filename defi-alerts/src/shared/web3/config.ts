import { Address } from 'viem';
import { arbitrum, base, mainnet, mantle, optimism, polygon, scroll, linea, ronin, unichain } from 'wagmi/chains';

export interface ChainConfig {
  chainId: number;
  name: string;
}

export interface MarketConfig {
  chainId: number;
  symbol: string;
  cometAddress: Address;
  baseAssetAddress: Address;
}

export const COMP_MAIN_PRICE_FEE = '0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5';
export const ETH_MAIN_PRICE_FEE = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
export const wstETH_MAIN_PRICE_FEE = '0x164b276057258d81941e97B0a900D4C7B358bCe0';
export const BTC_MAIN_PRICE_FEE = '0xAB7f623fb2F6fea6601D4350FA0E2290663C28Fc';
export const COMP_MAIN_COMET_ADDRESS: Address = '0xc3d688b66703497daa19211eedff47f25384cdc3';

export const CHAINS: ChainConfig[] = [
  { chainId: mainnet.id, name: 'Ethereum' },
  { chainId: optimism.id, name: 'Optimism' },
  { chainId: polygon.id, name: 'Polygon' },
  { chainId: arbitrum.id, name: 'Arbitrum' },
  { chainId: base.id, name: 'Base' },
  { chainId: scroll.id, name: 'Scroll' },
  { chainId: mantle.id, name: 'Mantle' },
  { chainId: ronin.id, name: 'Ronin' },
  { chainId: linea.id, name: 'Linea' },
  { chainId: unichain.id, name: 'Unichain' },
];

export const COMPOUND_MARKETS: MarketConfig[] = [
  {
    chainId: mainnet.id,
    symbol: 'wstETH',
    cometAddress: '0x3d0bb1ccaB520A66e607822fC55BC921738fAFE3' as Address,
    baseAssetAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'USDS',
    cometAddress: '0x5D409e56D886231aDAf00c8775665AD0f9897b56' as Address,
    baseAssetAddress: '0xdC035D45d973E3EC169d2276DDab16f1e407384F' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'USDC',
    cometAddress: '0xc3d688b66703497daa19211eedff47f25384cdc3' as Address,
    baseAssetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'WETH',
    cometAddress: '0xa17581a9e3356d9a858b789d68b4d866e593ae94' as Address,
    baseAssetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'USDT',
    cometAddress: '0x3afdc9bca9213a35503b077a6072f3d0d5ab0840' as Address,
    baseAssetAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
  },
  {
    chainId: optimism.id,
    symbol: 'USDC',
    cometAddress: '0x2e44e174f7d53f0212823acc11c01a11d58c5bcb' as Address,
    baseAssetAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address,
  },
  {
    chainId: optimism.id,
    symbol: 'USDT',
    cometAddress: '0x995e394b8b2437ac8ce61ee0bc610d617962b214' as Address,
    baseAssetAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' as Address,
  },
  {
    chainId: optimism.id,
    symbol: 'WETH',
    cometAddress: '0xe36a30d249f7761327fd973001a32010b521b6fd' as Address,
    baseAssetAddress: '0x4200000000000000000000000000000000000006' as Address,
  },
  {
    chainId: polygon.id,
    symbol: 'USDC.e',
    cometAddress: '0xf25212e676d1f7f89cd72ffee66158f541246445' as Address,
    baseAssetAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address,
  },
  {
    chainId: polygon.id,
    symbol: 'USDT',
    cometAddress: '0xaeb318360f27748acb200ce616e389a6c9409a07' as Address,
    baseAssetAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDC.e',
    cometAddress: '0xa5edbdd9646f8dff606d7448e414884c7d905dca' as Address,
    baseAssetAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDC',
    cometAddress: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf' as Address,
    baseAssetAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'WETH',
    cometAddress: '0x6f7d514bbd4aff3bcd1140b7344b32f063dee486' as Address,
    baseAssetAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDT',
    cometAddress: '0xd98be00b5d27fc98112bde293e487f8d4ca57d07' as Address,
    baseAssetAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as Address,
  },
  {
    chainId: base.id,
    symbol: 'USDC',
    cometAddress: '0xb125e6687d4313864e53df431d5425969c15eb2f' as Address,
    baseAssetAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
  },
  {
    chainId: base.id,
    symbol: 'USDbC',
    cometAddress: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf' as Address,
    baseAssetAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' as Address,
  },
  {
    chainId: base.id,
    symbol: 'AERO',
    cometAddress: '0x784efeB622244d2348d4F2522f8860B96fbEcE89' as Address,
    baseAssetAddress: '0x940181a94A35A4569E4529A3CDfB74e38FD98631' as Address,
  },
  {
    chainId: base.id,
    symbol: 'WETH',
    cometAddress: '0x46e6b214b524310239732d51387075e0e70970bf' as Address,
    baseAssetAddress: '0x4200000000000000000000000000000000000006' as Address,
  },
  {
    chainId: base.id,
    symbol: 'USDS',
    cometAddress: '0x2c776041CCFe903071AF44aa147368a9c8EEA518' as Address,
    baseAssetAddress: '0x820C137fa70C8691f0e44Dc420a5e53c168921Dc' as Address,
  },
  {
    chainId: unichain.id,
    symbol: 'USDC',
    cometAddress: '0x2c7118c4C88B9841FCF839074c26Ae8f035f2921' as Address,
    baseAssetAddress: '0x078D782b760474a361dDA0AF3839290b0EF57AD6' as Address,
  },
  {
    chainId: linea.id,
    symbol: 'USDC',
    cometAddress: '0x8D38A3d6B3c3B7d96D6536DA7Eef94A9d7dbC991' as Address,
    baseAssetAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' as Address,
  },
  {
    chainId: scroll.id,
    symbol: 'USDC',
    cometAddress: '0xb2f97c1bd3bf02f5e74d13f02e3e26f93d77ce44' as Address,
    baseAssetAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4' as Address,
  },
  {
    chainId: ronin.id,
    symbol: 'WETH',
    cometAddress: '0x4006eD4097Ee51c09A04c3B0951D28CCf19e6DFE' as Address,
    baseAssetAddress: '0xc99a6A985eD2Cac1ef41640596C5A5f9F4E19Ef5' as Address,
  },
  {
    chainId: mantle.id,
    symbol: 'USDe',
    cometAddress: '0x606174f62cd968d8e684c645080fa694c1D7786E' as Address,
    baseAssetAddress: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34' as Address,
  },
];

export const AAVE_MARKETS: MarketConfig[] = [
  {
    chainId: mainnet.id,
    symbol: 'wstETH',
    cometAddress: '0x3d0bb1ccaB520A66e607822fC55BC921738fAFE3' as Address,
    baseAssetAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'USDS',
    cometAddress: '0x5D409e56D886231aDAf00c8775665AD0f9897b56' as Address,
    baseAssetAddress: '0xdC035D45d973E3EC169d2276DDab16f1e407384F' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'USDC',
    cometAddress: '0xc3d688b66703497daa19211eedff47f25384cdc3' as Address,
    baseAssetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'WETH',
    cometAddress: '0xa17581a9e3356d9a858b789d68b4d866e593ae94' as Address,
    baseAssetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
  },
  {
    chainId: mainnet.id,
    symbol: 'USDT',
    cometAddress: '0x3afdc9bca9213a35503b077a6072f3d0d5ab0840' as Address,
    baseAssetAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
  },
  {
    chainId: optimism.id,
    symbol: 'USDC',
    cometAddress: '0x2e44e174f7d53f0212823acc11c01a11d58c5bcb' as Address,
    baseAssetAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address,
  },
  {
    chainId: optimism.id,
    symbol: 'USDT',
    cometAddress: '0x995e394b8b2437ac8ce61ee0bc610d617962b214' as Address,
    baseAssetAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' as Address,
  },
  {
    chainId: optimism.id,
    symbol: 'WETH',
    cometAddress: '0xe36a30d249f7761327fd973001a32010b521b6fd' as Address,
    baseAssetAddress: '0x4200000000000000000000000000000000000006' as Address,
  },
  {
    chainId: polygon.id,
    symbol: 'USDC.e',
    cometAddress: '0xf25212e676d1f7f89cd72ffee66158f541246445' as Address,
    baseAssetAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address,
  },
  {
    chainId: polygon.id,
    symbol: 'USDT',
    cometAddress: '0xaeb318360f27748acb200ce616e389a6c9409a07' as Address,
    baseAssetAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDC.e',
    cometAddress: '0xa5edbdd9646f8dff606d7448e414884c7d905dca' as Address,
    baseAssetAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDC',
    cometAddress: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf' as Address,
    baseAssetAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'WETH',
    cometAddress: '0x6f7d514bbd4aff3bcd1140b7344b32f063dee486' as Address,
    baseAssetAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' as Address,
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDT',
    cometAddress: '0xd98be00b5d27fc98112bde293e487f8d4ca57d07' as Address,
    baseAssetAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as Address,
  },
  {
    chainId: base.id,
    symbol: 'USDC',
    cometAddress: '0xb125e6687d4313864e53df431d5425969c15eb2f' as Address,
    baseAssetAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
  },
  {
    chainId: base.id,
    symbol: 'USDbC',
    cometAddress: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf' as Address,
    baseAssetAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' as Address,
  },
  {
    chainId: base.id,
    symbol: 'AERO',
    cometAddress: '0x784efeB622244d2348d4F2522f8860B96fbEcE89' as Address,
    baseAssetAddress: '0x940181a94A35A4569E4529A3CDfB74e38FD98631' as Address,
  },
  {
    chainId: base.id,
    symbol: 'WETH',
    cometAddress: '0x46e6b214b524310239732d51387075e0e70970bf' as Address,
    baseAssetAddress: '0x4200000000000000000000000000000000000006' as Address,
  },
  {
    chainId: base.id,
    symbol: 'USDS',
    cometAddress: '0x2c776041CCFe903071AF44aa147368a9c8EEA518' as Address,
    baseAssetAddress: '0x820C137fa70C8691f0e44Dc420a5e53c168921Dc' as Address,
  },
  {
    chainId: unichain.id,
    symbol: 'USDC',
    cometAddress: '0x2c7118c4C88B9841FCF839074c26Ae8f035f2921' as Address,
    baseAssetAddress: '0x078D782b760474a361dDA0AF3839290b0EF57AD6' as Address,
  },
  {
    chainId: linea.id,
    symbol: 'USDC',
    cometAddress: '0x8D38A3d6B3c3B7d96D6536DA7Eef94A9d7dbC991' as Address,
    baseAssetAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' as Address,
  },
  {
    chainId: scroll.id,
    symbol: 'USDC',
    cometAddress: '0xb2f97c1bd3bf02f5e74d13f02e3e26f93d77ce44' as Address,
    baseAssetAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4' as Address,
  },
  {
    chainId: ronin.id,
    symbol: 'WETH',
    cometAddress: '0x4006eD4097Ee51c09A04c3B0951D28CCf19e6DFE' as Address,
    baseAssetAddress: '0xc99a6A985eD2Cac1ef41640596C5A5f9F4E19Ef5' as Address,
  },
  {
    chainId: mantle.id,
    symbol: 'USDe',
    cometAddress: '0x606174f62cd968d8e684c645080fa694c1D7786E' as Address,
    baseAssetAddress: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34' as Address,
  },
];
