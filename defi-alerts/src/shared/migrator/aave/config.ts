import { Address } from 'viem';
import { arbitrum, base, mainnet, optimism, polygon, scroll } from 'wagmi/chains';

import { UniswapContracts } from '@/shared/web3/types';

export type AAVE_CONFIG_TYPE = { [key: number]: Address | { [key: string]: Address } };

export type NetworkContracts = {
  migrator: Address;
  adapter: Address;
};

type MigrationContracts = {
  [key: number]: NetworkContracts;
};

type ProxiContracts = {
  [key: number]: Address[];
};

type PathFinderContracts = {
  [key: number]: Address;
};

export const AAVE_CONFIG_POOL_CONTRACT: AAVE_CONFIG_TYPE = {
  [arbitrum.id]: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
  [base.id]: '0xd82a47fdebB5bf5329b09441C3DaB4b5df2153Ad',
  [optimism.id]: '0x7F23D86Ee20D869112572136221e173428DD740B',
  [polygon.id]: '0x7F23D86Ee20D869112572136221e173428DD740B',
  [scroll.id]: '0xe2108b60623C6Dcf7bBd535bD15a451fd0811f7b',
  [mainnet.id]: '0x41393e5e337606dc3821075Af65AeE84D7688CBD'
  // [mainnet.id]: {
  //   core: '0x41393e5e337606dc3821075Af65AeE84D7688CBD',
  //   prime: '0x08795CFE08C7a81dCDFf482BbAAF474B240f31cD',
  //   etherFi: '0xE7d490885A68f00d9886508DF281D67263ed5758',
  // },
};

export const AAVE_POOL_CONTRACT: AAVE_CONFIG_TYPE = {
  [arbitrum.id]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [base.id]: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  [optimism.id]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [polygon.id]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  [scroll.id]: '0x11fCfe756c05AD438e312a7fd934381537D3cFfe',
  [mainnet.id]: {
    core: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    prime: '0x4e033931ad43597d96D6bcc25c280717730B58B1',
    etherFi: '0x0AA97c284e98396202b6A04024F5E2c65026F3c0',
  },
};

export const AAVE_ORACLE_CONTRACT: AAVE_CONFIG_TYPE = {
  [arbitrum.id]: '0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7',
  [base.id]: '0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156',
  [optimism.id]: '0xD81eb3728a631871a7eBBaD631b5f424909f0c77',
  [polygon.id]: '0xb023e699F5a33916Ea823A16485e259257cA8Bd1',
  [scroll.id]: '0x04421D8C506E2fA2371a08EfAaBf791F624054F3',
  [mainnet.id]: {
    core: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
    prime: '0xE3C061981870C0C7b1f3C4F4bB36B95f1F260BE6',
    etherFi: '0x43b64f28A678944E0655404B0B98E443851cC34F',
  },
};

export const AAVE_CONFIG_POOL_ADDRESS_PROVIDER: AAVE_CONFIG_TYPE = {
  [arbitrum.id]: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
  [base.id]: '0xd82a47fdebB5bf5329b09441C3DaB4b5df2153Ad',
  [optimism.id]: '0x7F23D86Ee20D869112572136221e173428DD740B',
  [polygon.id]: '0x7F23D86Ee20D869112572136221e173428DD740B',
  [scroll.id]: '0x11fCfe756c05AD438e312a7fd934381537D3cFfe',
  [mainnet.id]: {
    core: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    prime: '0xcfBf336fe147D643B9Cb705648500e101504B16d',
    etherFi: '0xeBa440B438Ad808101d1c451C1C5322c90BEFCdA',
  },
};
// AAVE
export const CONTRACTS_BY_NETWORK_MIGRATION: MigrationContracts = {
  [arbitrum.id]: {
    migrator: '0x602198BDf1547086dC89d7b426822d95519D7844',
    adapter: '0xf0E4D3A96ebe87aE39560d2B19e53dCC00aB5d28',
  },
  [base.id]: {
    migrator: '0xd5D3C5492802D40E086B8cF12eB31D6BcC59ddA4',
    adapter: '0xD655Fb965aC05552e83A4c73A1F832024DC5F515',
  },
  [mainnet.id]: {
    migrator: '0x0ef2c369A5c5EbFe06C6a54276206b076319c99f',
    adapter: '0x147505db1811F3eE7aB5bb5d9Fed79f257F018E7',
  },
  [polygon.id]: {
    migrator: '0x70395912F72861FD42cA33Ce671bC936E5f29dCF',
    adapter: '0x0F4ee1b1B6451b7cE2b49378094695d3d6dE2e1d',
  },
  [optimism.id]: {
    migrator: '0x96d5e6C5821a384237673A4444ACf6721E4d9E1d',
    adapter: '0x74c15Aa6f11029e900493e53898dD558aF4B842f',
  },
};

// SPARK
export const CONTRACTS_BY_NETWORK_MIGRATION_SPARK: MigrationContracts = {
  [mainnet.id]: {
    migrator: '0x0ef2c369A5c5EbFe06C6a54276206b076319c99f',
    adapter: '0x8c16F393923E586447f5D583396cc7aC3E8d4AB9',
  },
};

// MORPHO
export const CONTRACTS_BY_NETWORK_MIGRATION_MORPHO: MigrationContracts = {
  [base.id]: {
    migrator: '0xd5D3C5492802D40E086B8cF12eB31D6BcC59ddA4',
    adapter: '0x037642eA98cCaed61Ba2eEC17cc799FE6691d39E',
  },
  [mainnet.id]: {
    migrator: '0x0ef2c369A5c5EbFe06C6a54276206b076319c99f',
    adapter: '0x1EFe17A612D9D64075bC77A403D246b858b800ab',
  },
};

// useUniswapQuote

export const DEFAULT_CONTRACTS: UniswapContracts = {
  factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  quoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
} as const;

export const UNISWAP_CONTRACTS: Record<number, UniswapContracts> = {
  [mainnet.id]: DEFAULT_CONTRACTS,
  [arbitrum.id]: DEFAULT_CONTRACTS,
  [polygon.id]: DEFAULT_CONTRACTS,
  [optimism.id]: DEFAULT_CONTRACTS,
  [base.id]: {
    factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
  },
} as const;

export const DEF_SLIPPAGE = ['100', '500', '3000', '10000'];

export const COMETS = [
  '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // Arbitrum - USDC.e Base (Bridged)
  '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // Arbitrum - USDC Base (Native)
  '0x6f7D514bbD4aFf3BcD1140B7344b32f063dEe486', // Arbitrum - WETH base
  '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07', // Arbitrum - USDT base
];

export const MORPHO_MAIN_CONTRACT: Record<number, `0x${string}`> = {
  [base.id]: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
  [mainnet.id]: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
};

// proxi swap

export const PROXI_SWAP_ADDRESSES: ProxiContracts = {
  // Ethereum Mainnet (ChainId: 1)
  [mainnet.id]: [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
    '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
    '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', // FEI
    '0x853d955aCEf822Db058eb8505911ED77F175b99e', // FRAX
  ],

  // Optimism (ChainId: 10)
  [optimism.id]: [
    '0x4200000000000000000000000000000000000006', // WETH (Optimism)
    '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb', // wstETH (Optimism)
  ],

  // Polygon (ChainId: 137)
  [polygon.id]: [
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC (Polygon)
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT (Polygon)
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI (Polygon)
    '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC (Polygon)
    '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', // LINK (Polygon)
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH (Polygon)
    '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a', // SUSHI (Polygon)
    '0x831753DD7087CaC61aB5644b308642cc1c33Dc13', // QUICK (Polygon)
    '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', // AAVE (Polygon)
  ],

  // Arbitrum (ChainId: 42161)
  [arbitrum.id]: [
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH (Arbitrum)
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC (Arbitrum)
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT (Arbitrum)
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI (Arbitrum)
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WBTC (Arbitrum)
    '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', // LINK (Arbitrum)
    '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
    '0x539bdE0d7Dbd336b79148AA742883198BBF60342', // MAGIC (Arbitrum)
    '0x6694340fc020c5E6B96567843da2df01b2CE1eb6', // STG (Arbitrum)
    // '0xB752d7a4E7ebBf71c1C37d3941496F6376a0Edd1', // STRK (Arbitrum)
  ],

  // Base (ChainId: 8453)
  [base.id]: [
    '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452', // WETH (Base)
    '0x4200000000000000000000000000000000000006', // WETH (Base)
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC (Base)
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDC (Base)
    // '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI (Base)
    // '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', // cbETH (Base)
    // // '0xB79DD08EA68A908902D790A5CFE16D18FE49A0A1', // USDbC (Base)
    // '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC (Bridged)
    // '0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9', // BALD
    // '0x4158734D47Fc9692176B5085E0F52ee0Da5d47F1', // MIM (Base)
    // // '0xE5417da38F196176E1E0448D2371b801d0D15bC0', // TBTC (Base)
    // '0x940181a94A35A4569E4529A3CDfB74e38FD98631', // WBTC (Base)
  ],

  // Scroll (ChainId: 534352)
  [scroll.id]: [
    '0x5300000000000000000000000000000000000004', // WETH (Scroll)
    '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4', // USDC (Scroll)
    '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df', // USDT (Scroll)
    '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97', // DAI (Scroll)
    '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1', // WBTC (Scroll)
    '0xE5ef1aB309A98E11E8708480D2361F3d6a8b764d', // LINK (Scroll)
    '0x0575f8538EF437eA98fe1B11Ad4C89648e4b5142', // USDR (Scroll)
    '0x8B83D4B418E66aA33Dca2Ed80C893E8FF7bd6df0', // SiVGX (Scroll)
    '0xA5B3c6721a52e793EcE08A282b1E72140fc5e1Af', // ETHx (Scroll)
    '0xab1A8e0f381e501dF83Dd0C244B8ec5d5064ca19', // SKALE (Scroll)
  ],

  // Mantle (ChainId: 5000)
  // [mantle.id]: [
  //   '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111', // WETH (Mantle)
  //   '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9', // USDC (Mantle)
  //   '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE', // USDT (Mantle)
  //   '0x5bE26527e817998A7206475496fDE1E68957c5A6', // DAI (Mantle)
  //   '0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2', // WBTC (Mantle)
  //   '0x498f7bB59c61307De7dEA005877220e4406470e9', // MNT
  //   '0xad42D014232A6e32AF717B4d4c05CdE8D04c9Ca6', // LINK (Mantle)
  //   '0x27d2decb4bfc9c76f0309b8e88dec3a601fe25a8', // METIS (Mantle)
  //   '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8', // WMNT (Mantle)
  //   '0xE3234e57ac38890a9136247d4c323C0fCE5c062D', // agEUR (Mantle)
  // ],
};

export const PATH_FINDER_CONTRACTS: PathFinderContracts = {
  [mainnet.id]: '0x876dD243c5ad4d9D9FAb98CAF71E16CB1833c9Ae',
  [optimism.id]: '0xf145bc354aeca1E5EafB7f7F7d431cC7A308A990',
  [polygon.id]: '0xdb83bc921d49Bf73326D7BBA36a8CF8211d62534',
  [arbitrum.id]: '0xbe7873DF7407b570bDe3406e50f76AB1A63b748b',
  [base.id]: '0x6e30F794aD268Cf92131303a4557B097CF93c621',
};

export const FLASH_DATA = [
  {
    liquidityPool: '0x8e295789c9465487074a65b1ae9Ce0351172393f', // USDC / USDC.e
    baseToken: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC.e
    token0: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC.e
    token1: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
    fee: 100,
  },
  {
    liquidityPool: '0x8e295789c9465487074a65b1ae9Ce0351172393f', // USDC / USDC.e
    baseToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
    token0: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC.e
    token1: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
    fee: 100,
  },
  {
    liquidityPool: '0x641C00A822e8b671738d32a431a4Fb6074E5c79d', // WETH / USDT
    baseToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
    token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
    token1: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
    fee: 500,
  },
  {
    liquidityPool: '0x641C00A822e8b671738d32a431a4Fb6074E5c79d', // WETH / USDT
    baseToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
    token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
    token1: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
    fee: 500,
  },
];
