import { arbitrum, base, mainnet, mantle, optimism, polygon, scroll, sepolia } from 'wagmi/chains';

import { ContractsNameType, Names, Networks, NetworksNative, Tokens } from './types';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ContractsName = {
  token: 'Token',
} as const;

export const NetworksNames: Networks = {
  [mainnet.id]: 'Ethereum',
  [polygon.id]: 'Polygon',
  [arbitrum.id]: 'Arbitrum',
  [base.id]: 'Base',
  [scroll.id]: 'Scroll',
  [optimism.id]: 'Optimism',
  [sepolia.id]: 'Sepolia',
  [mantle.id]: 'Mantle',
};

export const NetworksNativeData: NetworksNative = {
  [mainnet.id]: mainnet.nativeCurrency,
  [polygon.id]: polygon.nativeCurrency,
  [arbitrum.id]: arbitrum.nativeCurrency,
  [base.id]: base.nativeCurrency,
  [scroll.id]: scroll.nativeCurrency,
  [optimism.id]: optimism.nativeCurrency,
  [sepolia.id]: sepolia.nativeCurrency,
  [mantle.id]: mantle.nativeCurrency,
};

export const NetworksWrappedNativeData: Networks = {
  [mainnet.id]: 'WETH',
  [polygon.id]: 'WPOL',
  [arbitrum.id]: 'WETH',
  [base.id]: 'WETH',
  [scroll.id]: 'WETH',
  [optimism.id]: 'WETH',
  [sepolia.id]: 'WETH',
  [mantle.id]: 'WMNT', // ??
};

export const NamesNetworks: Names = {
  ethereum: mainnet.id,
  polygon: polygon.id,
  arbitrum: arbitrum.id,
  base: base.id,
  scroll: scroll.id,
  optimism: optimism.id,
  sepolia: sepolia.id,
  mantle: mantle.id,
};

export const CurrentNetworkExplorerURL: Networks = {
  [mainnet.id]: mainnet.blockExplorers.default.url,
  [polygon.id]: polygon.blockExplorers.default.url,
  [arbitrum.id]: arbitrum.blockExplorers.default.url,
  [base.id]: base.blockExplorers.default.url,
  [scroll.id]: scroll.blockExplorers.default.url,
  [optimism.id]: optimism.blockExplorers.default.url,
  [sepolia.id]: sepolia.blockExplorers.default.url,
  [mantle.id]: mantle.blockExplorers.default.url,
};

export const contractsConfig: Record<ContractsNameType, Tokens> = {
  token: {
    [mainnet.id]: {
      wstETH: {
        addressFrom: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        bulker: '0x2c776041CCFe903071AF44aa147368a9c8EEA518',
        addressTo: '0x3D0bb1ccaB520A66e607822fC55BC921738fAFE3',
        decimals: 18,
        isNative: false,
      },
      USDS: {
        addressFrom: '0xdC035D45d973E3EC169d2276DDab16f1e407384F',
        bulker: '0xa397a8C2086C554B531c02E29f3291c9704B00c7',
        addressTo: '0x5D409e56D886231aDAf00c8775665AD0f9897b56',
        decimals: 6,
        isNative: false,
      },
      USDC: {
        addressFrom: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        bulker: '0x74a81F84268744a40FEBc48f8b812a1f188D80C3',
        addressTo: '0xc3d688b66703497daa19211eedff47f25384cdc3',
        decimals: 6,
        unique: true,
        isNative: false,
      },
      ETH: {
        addressFrom: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        addressTo: '0xa17581a9e3356d9a858b789d68b4d866e593ae94',
        bulker: '0xa397a8c2086c554b531c02e29f3291c9704b00c7',
        decimals: 18,
        isNative: true,
      },
      USDT: {
        addressFrom: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        addressTo: '0x3afdc9bca9213a35503b077a6072f3d0d5ab0840',
        bulker: '0xa397a8c2086c554b531c02e29f3291c9704b00c7',
        decimals: 6,
        isNative: false,
      },
    },

    [polygon.id]: {
      'USDC.e': {
        addressFrom: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        addressTo: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
        bulker: '0x59e242D352ae13166B4987aE5c990C232f7f7CD6',
        decimals: 6,
        isNative: false,
      },
      USDT: {
        addressFrom: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        addressTo: '0xaeB318360f27748Acb200CE616E389A6C9409a07',
        bulker: '0x59e242D352ae13166B4987aE5c990C232f7f7CD6',
        decimals: 6,
        isNative: false,
      },
    },
    [arbitrum.id]: {
      USDCe: {
        addressFrom: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        addressTo: '0xa5edbdd9646f8dff606d7448e414884c7d905dca',
        bulker: '0xbde8f31d2ddda895264e27dd990fab3dc87b372d',
        decimals: 6,
        isNative: false,
      },
      USDC: {
        addressFrom: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        addressTo: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf',
        bulker: '0xbde8f31d2ddda895264e27dd990fab3dc87b372d',
        isNative: false,
        decimals: 6,
      },
      ETH: {
        addressFrom: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        addressTo: '0x6f7d514bbd4aff3bcd1140b7344b32f063dee486',
        bulker: '0xbde8f31d2ddda895264e27dd990fab3dc87b372d',
        isNative: true,
        decimals: 18,
      },
      USDT: {
        addressFrom: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        addressTo: '0xd98be00b5d27fc98112bde293e487f8d4ca57d07',
        bulker: '0xbde8f31d2ddda895264e27dd990fab3dc87b372d',
        isNative: false,
        decimals: 6,
      },
    },
    [base.id]: {
      USDC: {
        addressFrom: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        addressTo: '0xb125e6687d4313864e53df431d5425969c15eb2f',
        bulker: '0x78d0677032a35c63d142a48a2037048871212a8c',
        isNative: false,
        decimals: 6,
      },
      USDbC: {
        addressFrom: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
        addressTo: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf',
        bulker: '0x78d0677032a35c63d142a48a2037048871212a8c',
        isNative: false,
        decimals: 6,
      },
      AERO: {
        addressFrom: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
        addressTo: '0x784efeB622244d2348d4F2522f8860B96fbEcE89',
        bulker: '0x78d0677032a35c63d142a48a2037048871212a8c',
        isNative: false,
        decimals: 18,
      },
      ETH: {
        addressFrom: '0x4200000000000000000000000000000000000006',
        addressTo: '0x46e6b214b524310239732d51387075e0e70970bf',
        bulker: '0x78d0677032a35c63d142a48a2037048871212a8c',
        isNative: true,
        decimals: 18,
      },
    },
    [scroll.id]: {
      USDC: {
        addressFrom: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
        addressTo: '0xb2f97c1bd3bf02f5e74d13f02e3e26f93d77ce44',
        bulker: '0x53c6d04e3ec7031105baea05b36cbc3c987c56fa',
        isNative: false,
        decimals: 6,
      },
    },
    [optimism.id]: {
      USDC: {
        addressFrom: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
        addressTo: '0x2e44e174f7d53f0212823acc11c01a11d58c5bcb',
        bulker: '0xcb3643cc8294b23171272845473dec49739d4ba3',
        isNative: false,
        decimals: 6,
      },
      USDT: {
        addressFrom: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        addressTo: '0x995e394b8b2437ac8ce61ee0bc610d617962b214',
        bulker: '0xcb3643cc8294b23171272845473dec49739d4ba3',
        isNative: false,
        decimals: 6,
      },
      ETH: {
        addressFrom: '0x4200000000000000000000000000000000000006',
        addressTo: '0xe36a30d249f7761327fd973001a32010b521b6fd',
        bulker: '0xcb3643cc8294b23171272845473dec49739d4ba3',
        isNative: true,
        decimals: 18,
      },
    },
    [mantle.id]: {
      USDe: {
        addressFrom: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
        addressTo: '0x606174f62cd968d8e684c645080fa694c1D7786E',
        bulker: '0x67DFCa85CcEEFA2C5B1dB4DEe3BEa716A28B9baa',
        isNative: false,
        decimals: 18,
      },
    },
    [sepolia.id]: {
      USDC: {
        addressFrom: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        addressTo: '0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e',
        bulker: '0x157c001bb1F8b33743B14483Be111C961d8e11dE',
        isNative: false,
        decimals: 6,
      },
      ETH: {
        addressFrom: '0x2D5ee574e710219a521449679A4A7f2B43f046ad',
        addressTo: '0x2943ac1216979aD8dB76D9147F64E61adc126e96',
        bulker: '0xaD0C044425D81a2E223f4CE699156900fead2Aaa',
        isNative: true,
        decimals: 18,
      },
    },
  },
};
