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
  collaterals: Address[];
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
    collaterals: ['0xa1290d69c65a6fe4df752f95823fae25cb99e5a7', '0xbf5495efe5db9ce00f80364c8b423567e58d2110', '0xd11c452fc99cf405034ee446803b6f6c1f6d5ed8'],
  },
  {
    chainId: mainnet.id,
    symbol: 'USDS',
    cometAddress: '0x5D409e56D886231aDAf00c8775665AD0f9897b56' as Address,
    baseAssetAddress: '0xdC035D45d973E3EC169d2276DDab16f1e407384F' as Address,
    collaterals: [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      '0x18084fba666a33d37592fa2633fd49a74dd93a88',
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      '0xa3931d71877c0e7a3148cb7eb4463524fec27fbd',
      '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
      '0x56072c95faa701256059aa122697b133aded9279',
    ],
  },
  {
    chainId: mainnet.id,
    symbol: 'USDC',
    cometAddress: '0xc3d688b66703497daa19211eedff47f25384cdc3' as Address,
    baseAssetAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    collaterals: [
      '0xc00e94cb662c3520282e6f5717214004a7f26888',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      '0x514910771af9ca656af840dff83e8264ecf986ca',
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      '0x18084fba666a33d37592fa2633fd49a74dd93a88',
      '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
    ],
  },
  {
    chainId: mainnet.id,
    symbol: 'WETH',
    cometAddress: '0xa17581a9e3356d9a858b789d68b4d866e593ae94' as Address,
    baseAssetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
    collaterals: [
      '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      '0xae78736cd615f374d3085123a210448e74fc6393',
      '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
      '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
      '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0xbf5495efe5db9ce00f80364c8b423567e58d2110',
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      '0xfae103dc9cf190ed75350761e95403b7b8afa6c0',
      '0x18084fba666a33d37592fa2633fd49a74dd93a88',
      '0xa35b1b31ce002fbf2058d22f30f95d405200a15b',
      '0xd11c452fc99cf405034ee446803b6f6c1f6d5ed8',
    ],
  },
  {
    chainId: mainnet.id,
    symbol: 'USDT',
    cometAddress: '0x3afdc9bca9213a35503b077a6072f3d0d5ab0840' as Address,
    baseAssetAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
    collaterals: [
      '0xc00e94cb662c3520282e6f5717214004a7f26888',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      '0x514910771af9ca656af840dff83e8264ecf986ca',
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      '0x18084fba666a33d37592fa2633fd49a74dd93a88',
      '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812',
      '0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32',
      '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
      '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
    ],
  },
  {
    chainId: optimism.id,
    symbol: 'USDC',
    cometAddress: '0x2e44e174f7d53f0212823acc11c01a11d58c5bcb' as Address,
    baseAssetAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' as Address,
    collaterals: [
      '0x4200000000000000000000000000000000000042',
      '0x4200000000000000000000000000000000000006',
      '0x68f180fcce6836688e9084f035309e29bf0a2095',
      '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb',
      '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812',
    ],
  },
  {
    chainId: optimism.id,
    symbol: 'USDT',
    cometAddress: '0x995e394b8b2437ac8ce61ee0bc610d617962b214' as Address,
    baseAssetAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' as Address,
    collaterals: [
      '0x4200000000000000000000000000000000000042',
      '0x4200000000000000000000000000000000000006',
      '0x68f180fcce6836688e9084f035309e29bf0a2095',
      '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb',
      '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812',
    ],
  },
  {
    chainId: optimism.id,
    symbol: 'WETH',
    cometAddress: '0xe36a30d249f7761327fd973001a32010b521b6fd' as Address,
    baseAssetAddress: '0x4200000000000000000000000000000000000006' as Address,
    collaterals: [
      '0x1f32b1c2345538c0c6f582fcb022739c4a194ebb',
      '0x9bcef72be871e61ed4fbbc7630889bee758eb81d',
      '0x68f180fcce6836688e9084f035309e29bf0a2095',
      '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      '0x2416092f143378750bb29b79ed961ab195cceea5',
      '0x5a7facb970d094b6c7ff1df0ea68d99e6e73cbff',
      '0x87eee96d50fb761ad85b1c982d28a042169d61b1',
    ],
  },
  {
    chainId: polygon.id,
    symbol: 'USDC.e',
    cometAddress: '0xf25212e676d1f7f89cd72ffee66158f541246445' as Address,
    baseAssetAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as Address,
    collaterals: [
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
      '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
      '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
    ],
  },
  {
    chainId: polygon.id,
    symbol: 'USDT',
    cometAddress: '0xaeb318360f27748acb200ce616e389a6c9409a07' as Address,
    baseAssetAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as Address,
    collaterals: [
      '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
      '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
      '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
    ],
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDC.e',
    cometAddress: '0xa5edbdd9646f8dff606d7448e414884c7d905dca' as Address,
    baseAssetAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' as Address,
    collaterals: [
      '0x912ce59144191c1204e64559fe8253a0e49e6548',
      '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a',
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    ],
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDC',
    cometAddress: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf' as Address,
    baseAssetAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as Address,
    collaterals: [
      '0x912ce59144191c1204e64559fe8253a0e49e6548',
      '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a',
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      '0x5979d7b546e38e414f7e9822514be443a4800529',
      '0x2416092f143378750bb29b79ed961ab195cceea5',
      '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812',
    ],
  },
  {
    chainId: arbitrum.id,
    symbol: 'WETH',
    cometAddress: '0x6f7d514bbd4aff3bcd1140b7344b32f063dee486' as Address,
    baseAssetAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' as Address,
    collaterals: [
      '0x35751007a407ca6feffe80b3cb397736d2cf4dbe',
      '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8',
      '0x5979d7b546e38e414f7e9822514be443a4800529',
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      '0x4186bfc76e2e237523cbc30fd220fe055156b41f',
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      '0x2416092f143378750bb29b79ed961ab195cceea5',
    ],
  },
  {
    chainId: arbitrum.id,
    symbol: 'USDT',
    cometAddress: '0xd98be00b5d27fc98112bde293e487f8d4ca57d07' as Address,
    baseAssetAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as Address,
    collaterals: [
      '0x912ce59144191c1204e64559fe8253a0e49e6548',
      '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      '0x5979d7b546e38e414f7e9822514be443a4800529',
      '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a',
    ],
  },
  {
    chainId: base.id,
    symbol: 'USDC',
    cometAddress: '0xb125e6687d4313864e53df431d5425969c15eb2f' as Address,
    baseAssetAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address,
    collaterals: [
      '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
      '0x4200000000000000000000000000000000000006',
      '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
    ],
  },
  {
    chainId: base.id,
    symbol: 'USDbC',
    cometAddress: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf' as Address,
    baseAssetAddress: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' as Address,
    collaterals: ['0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22', '0x4200000000000000000000000000000000000006'],
  },
  {
    chainId: base.id,
    symbol: 'AERO',
    cometAddress: '0x784efeB622244d2348d4F2522f8860B96fbEcE89' as Address,
    baseAssetAddress: '0x940181a94A35A4569E4529A3CDfB74e38FD98631' as Address,
    collaterals: [
      '0x4200000000000000000000000000000000000006',
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
    ],
  },
  {
    chainId: base.id,
    symbol: 'WETH',
    cometAddress: '0x46e6b214b524310239732d51387075e0e70970bf' as Address,
    baseAssetAddress: '0x4200000000000000000000000000000000000006' as Address,
    collaterals: [
      '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
      '0x2416092f143378750bb29b79ed961ab195cceea5',
      '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      '0x04c0599ae5a44757c0af6f9ec3b93da8976c150a',
      '0xedfa23602d0ec14714057867a78d01e94176bea0',
      '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      '0x7fcd174e80f264448ebee8c88a7c4476aaf58ea6',
    ],
  },
  {
    chainId: base.id,
    symbol: 'USDS',
    cometAddress: '0x2c776041CCFe903071AF44aa147368a9c8EEA518' as Address,
    baseAssetAddress: '0x820C137fa70C8691f0e44Dc420a5e53c168921Dc' as Address,
    collaterals: ['0x5875eee11cf8398102fdad704c9e96607675467a', '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'],
  },
  {
    chainId: unichain.id,
    symbol: 'USDC',
    cometAddress: '0x2c7118c4C88B9841FCF839074c26Ae8f035f2921' as Address,
    baseAssetAddress: '0x078D782b760474a361dDA0AF3839290b0EF57AD6' as Address,
    collaterals: ['0x8f187aa05619a017077f5308904739877ce9ea21', '0x4200000000000000000000000000000000000006'],
  },
  {
    chainId: unichain.id,
    symbol: 'WETH',
    cometAddress: '0x6C987dDE50dB1dcDd32Cd4175778C2a291978E2a' as Address,
    baseAssetAddress: '0x4200000000000000000000000000000000000006' as Address,
    collaterals: [
      '0xc02fE7317D4eb8753a02c35fe019786854A92001',
      '0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7',
      '0x2416092f143378750bb29b79eD961ab195CcEea5',
      '0x8f187aa05619a017077f5308904739877ce9ea21',
      '0x927B51f251480a681271180DA4de28D44EC4AfB8',
    ],
  },
  {
    chainId: linea.id,
    symbol: 'USDC',
    cometAddress: '0x8D38A3d6B3c3B7d96D6536DA7Eef94A9d7dbC991' as Address,
    baseAssetAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' as Address,
    collaterals: ['0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f', '0xb5bedd42000b71fdde22d3ee8a79bd49a568fc8f', '0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4'],
  },
  {
    chainId: scroll.id,
    symbol: 'USDC',
    cometAddress: '0xb2f97c1bd3bf02f5e74d13f02e3e26f93d77ce44' as Address,
    baseAssetAddress: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4' as Address,
    collaterals: ['0x5300000000000000000000000000000000000004', '0xf610a9dfb7c89644979b4a0f27063e9e7d7cda32'],
  },
  {
    chainId: ronin.id,
    symbol: 'WETH',
    cometAddress: '0x4006eD4097Ee51c09A04c3B0951D28CCf19e6DFE' as Address,
    baseAssetAddress: '0xc99a6A985eD2Cac1ef41640596C5A5f9F4E19Ef5' as Address,
    collaterals: ['0xe514d9deb7966c8be0ca922de8a064264ea6bcd4', '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc', '0x97a9107c1793bc407d6f527b77e7fff4d812bece'],
  },
  {
    chainId: mantle.id,
    symbol: 'USDe',
    cometAddress: '0x606174f62cd968d8e684c645080fa694c1D7786E' as Address,
    baseAssetAddress: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34' as Address,
    collaterals: ['0xcda86a272531e8640cd7f1a92c01839911b90bb0', '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111', '0xc96de26018a54d51c097160568752c4e3bd6c364'],
  },
];
