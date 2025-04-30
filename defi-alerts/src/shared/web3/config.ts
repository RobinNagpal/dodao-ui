import { Address } from "viem";
import {
  arbitrum,
  base,
  mainnet,
  mantle,
  optimism,
  polygon,
  scroll,
  linea,
  ronin,
  unichain,
  sepolia,
} from "wagmi/chains";

import {
  MARKET_ADDRESSES_TYPE,
  Networks,
  SupportedChainId,
  TOKEN_SYMBOLS_TYPE,
} from "./types";

export const NetworksNames: Networks =
  process.env.NEXT_PUBLIC_TEST_MODE === "true"
    ? {
        [mainnet.id]: "Ethereum",
        [polygon.id]: "Polygon",
        [optimism.id]: "Optimism",
        [arbitrum.id]: "Arbitrum",
        [base.id]: "Base",
        // [scroll.id]: 'Scroll',
        [mantle.id]: "Mantle",
        // [sepolia.id]: 'Sepolia',
      }
    : {
        // [mainnet.id]: "Ethereum",
        // [optimism.id]: "Optimism",
        // [polygon.id]: "Polygon",
        // [arbitrum.id]: "Arbitrum",
        // [base.id]: "Base",
        // [scroll.id]: "Scroll",
        // [mantle.id]: "Mantle",
        // [ronin.id]: "Ronin",
        [linea.id]: "Linea",
        // [unichain.id]: "Unichain",
        // [sepolia.id]: 'Sepolia',
      };

const methods = ["getUtilization"];

export const COMP_MAIN_PRICE_FEE = "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5";
export const ETH_MAIN_PRICE_FEE = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
export const wstETH_MAIN_PRICE_FEE =
  "0x164b276057258d81941e97B0a900D4C7B358bCe0";
export const BTC_MAIN_PRICE_FEE = "0xAB7f623fb2F6fea6601D4350FA0E2290663C28Fc";
export const COMP_MAIN_COMET_ADDRESS: Address =
  "0xc3d688b66703497daa19211eedff47f25384cdc3";

export const REWARDS_ADDRESSES: Record<SupportedChainId, Address> = {
  [sepolia.id]: "0x8bF5b658bdF0388E8b482ED51B14aef58f90abfD",
  [mainnet.id]: "0x1B0e765F6224C21223AeA2af16c1C46E38885a40",
  [polygon.id]: "0x45939657d1CA34A8FA39A924B71D28Fe8431e581",
  [arbitrum.id]: "0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae",
  [base.id]: "0x123964802e6ABabBE1Bc9547D72Ef1B69B00A6b1",
  [scroll.id]: "0x70167D30964cbFDc315ECAe02441Af747bE0c5Ee",
  [optimism.id]: "0x443EA0340cb75a160F31A440722dec7b5bc3C2E9",
  [mantle.id]: "0xCd83CbBFCE149d141A5171C3D6a0F0fCCeE225Ab",
};

export const CONFIGURATOR_ADDRESSES: Record<SupportedChainId, Address> = {
  [sepolia.id]: "0xc28aD44975C614EaBe0Ed090207314549e1c6624",
  [mainnet.id]: "0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3",
  [polygon.id]: "0x83E0F742cAcBE66349E3701B171eE2487a26e738",
  [arbitrum.id]: "0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775",
  [base.id]: "0x45939657d1CA34A8FA39A924B71D28Fe8431e581",
  [scroll.id]: "0xECAB0bEEa3e5DEa0c35d3E69468EAC20098032D7",
  [optimism.id]: "0x84E93EC6170ED630f5ebD89A1AAE72d4F63f2713",
  [mantle.id]: "0xb77Cd4cD000957283D8BAf53cD782ECf029cF7DB",
};

export const BULKER_ADDRESS: Record<
  SupportedChainId,
  { [key: string]: Address }
> = {
  [mainnet.id]: {
    USDC: "0x74a81F84268744a40FEBc48f8b812a1f188D80C3",
    wstETH: "0x2c776041CCFe903071AF44aa147368a9c8EEA518",
    USDS: "0xa397a8C2086C554B531c02E29f3291c9704B00c7",
    ETH: "0xa397a8c2086c554b531c02e29f3291c9704b00c7",
    USDT: "0xa397a8c2086c554b531c02e29f3291c9704b00c7",
  },

  [polygon.id]: {
    "USDC.e": "0x59e242D352ae13166B4987aE5c990C232f7f7CD6",
    USDT: "0x59e242D352ae13166B4987aE5c990C232f7f7CD6",
  },
  [arbitrum.id]: {
    USDCe: "0xbde8f31d2ddda895264e27dd990fab3dc87b372d",
    USDC: "0xbde8f31d2ddda895264e27dd990fab3dc87b372d",
    ETH: "0xbde8f31d2ddda895264e27dd990fab3dc87b372d",
    USDT: "0xbde8f31d2ddda895264e27dd990fab3dc87b372d",
  },
  [base.id]: {
    USDC: "0x78d0677032a35c63d142a48a2037048871212a8c",
    USDbC: "0x78d0677032a35c63d142a48a2037048871212a8c",
    AERO: "0x78d0677032a35c63d142a48a2037048871212a8c",
    ETH: "0x78d0677032a35c63d142a48a2037048871212a8c",
  },
  [scroll.id]: {
    USDC: "0x53c6d04e3ec7031105baea05b36cbc3c987c56fa",
  },
  [optimism.id]: {
    USDC: "0xcb3643cc8294b23171272845473dec49739d4ba3",
    USDT: "0xcb3643cc8294b23171272845473dec49739d4ba3",
    ETH: "0xcb3643cc8294b23171272845473dec49739d4ba3",
  },
  [mantle.id]: {
    USDe: "0x67DFCa85CcEEFA2C5B1dB4DEe3BEa716A28B9baa",
  },
  [sepolia.id]: {
    USDC: "0x157c001bb1F8b33743B14483Be111C961d8e11dE",
    ETH: "0xaD0C044425D81a2E223f4CE699156900fead2Aaa",
  },
};

export const TOKEN_SYMBOLS: TOKEN_SYMBOLS_TYPE = {
  [sepolia.id]: {
    "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e": "USDC",
    "0x2943ac1216979aD8dB76D9147F64E61adc126e96": "ETH",
  },
  [arbitrum.id]: {
    "0xa5edbdd9646f8dff606d7448e414884c7d905dca": "USDCe",
    "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf": "USDC",
    "0x6f7d514bbd4aff3bcd1140b7344b32f063dee486": "ETH",
    "0xd98be00b5d27fc98112bde293e487f8d4ca57d07": "USDT",
  },
  [polygon.id]: {
    "0xf25212e676d1f7f89cd72ffee66158f541246445": "USDC.e",
    "0xaeb318360f27748acb200ce616e389a6c9409a07": "USDT",
  },
  [scroll.id]: {
    "0xb2f97c1bd3bf02f5e74d13f02e3e26f93d77ce44": "USDC",
  },
  [optimism.id]: {
    "0x2e44e174f7d53f0212823acc11c01a11d58c5bcb": "USDC",
    "0x995e394b8b2437ac8ce61ee0bc610d617962b214": "USDT",
    "0xe36a30d249f7761327fd973001a32010b521b6fd": "ETH",
  },
  [base.id]: {
    "0xb125e6687d4313864e53df431d5425969c15eb2f": "USDC",
    "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf": "USDbC",
    "0x784efeB622244d2348d4F2522f8860B96fbEcE89": "AERO",
    "0x46e6b214b524310239732d51387075e0e70970bf": "ETH",
  },
  [mantle.id]: {
    "0x606174f62cd968d8e684c645080fa694c1D7786E": "USDe",
  },
  [mainnet.id]: {
    "0x3D0bb1ccaB520A66e607822fC55BC921738fAFE3": "wstETH",
    "0x5D409e56D886231aDAf00c8775665AD0f9897b56": "USDS",
    "0xc3d688b66703497daa19211eedff47f25384cdc3": "USDC",
    "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840": "USDT",
    "0xa17581a9e3356d9a858b789d68b4d866e593ae94": "ETH",
  },
};

export const MARKET_ADDRESSES_HOME: MARKET_ADDRESSES_TYPE = {
  [arbitrum.id]: {
    USDC: {
      address: "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf",
      methods: methods,
    },
    ETH: {
      address: "0x6f7d514bbd4aff3bcd1140b7344b32f063dee486",
      methods: methods,
    },
    USDT: {
      address: "0xd98be00b5d27fc98112bde293e487f8d4ca57d07",
      methods: methods,
    },
  },
  [mainnet.id]: {
    USDC: {
      address: "0xc3d688b66703497daa19211eedff47f25384cdc3",
      methods: methods,
    },
    ETH: {
      address: "0xa17581a9e3356d9a858b789d68b4d866e593ae94",
      methods: methods,
    },
    USDT: {
      address: "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840",
      methods: methods,
    },
  },
  [base.id]: {
    USDC: {
      address: "0xb125e6687d4313864e53df431d5425969c15eb2f",
      methods: methods,
    },
  },
  [polygon.id]: {
    "USDC.e": {
      address: "0xf25212e676d1f7f89cd72ffee66158f541246445",
      methods: methods,
    },
  },
};

export const MARKET_ADDRESSES: MARKET_ADDRESSES_TYPE = {
  [sepolia.id]: {
    USDC: {
      address: "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e",
      methods: methods,
    },
    ETH: {
      address: "0x2943ac1216979aD8dB76D9147F64E61adc126e96",
      methods: methods,
    },
  },
  [arbitrum.id]: {
    USDCe: {
      address: "0xa5edbdd9646f8dff606d7448e414884c7d905dca",
      methods: methods,
    },
    USDC: {
      address: "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf",
      methods: methods,
    },
    ETH: {
      address: "0x6f7d514bbd4aff3bcd1140b7344b32f063dee486",
      methods: methods,
    },
    USDT: {
      address: "0xd98be00b5d27fc98112bde293e487f8d4ca57d07",
      methods: methods,
    },
  },
  [polygon.id]: {
    "USDC.e": {
      address: "0xf25212e676d1f7f89cd72ffee66158f541246445",
      methods: methods,
    },
    USDT: {
      address: "0xaeb318360f27748acb200ce616e389a6c9409a07",
      methods: methods,
    },
  },
  [scroll.id]: {
    USDC: {
      address: "0xb2f97c1bd3bf02f5e74d13f02e3e26f93d77ce44",
      methods: methods,
    },
  },
  [optimism.id]: {
    USDC: {
      address: "0x2e44e174f7d53f0212823acc11c01a11d58c5bcb",
      methods: methods,
    },
    USDT: {
      address: "0x995e394b8b2437ac8ce61ee0bc610d617962b214",
      methods: methods,
    },
    ETH: {
      address: "0xe36a30d249f7761327fd973001a32010b521b6fd",
      methods: methods,
    },
  },
  [base.id]: {
    USDC: {
      address: "0xb125e6687d4313864e53df431d5425969c15eb2f",
      methods: methods,
    },
    USDbC: {
      address: "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf",
      methods: methods,
    },
    AERO: {
      address: "0x784efeB622244d2348d4F2522f8860B96fbEcE89",
      methods: methods,
    },
    ETH: {
      address: "0x46e6b214b524310239732d51387075e0e70970bf",
      methods: methods,
    },
  },
  [mainnet.id]: {
    wstETH: {
      address: "0x3D0bb1ccaB520A66e607822fC55BC921738fAFE3",
      methods: methods,
    },
    USDS: {
      address: "0x5D409e56D886231aDAf00c8775665AD0f9897b56",
      methods: methods,
    },
    USDC: {
      address: "0xc3d688b66703497daa19211eedff47f25384cdc3",
      methods: methods,
    },
    ETH: {
      address: "0xa17581a9e3356d9a858b789d68b4d866e593ae94",
      methods: methods,
    },
    USDT: {
      address: "0x3afdc9bca9213a35503b077a6072f3d0d5ab0840",
      methods: methods,
    },
  },
  [mantle.id]: {
    USDe: {
      address: "0x606174f62cd968d8e684c645080fa694c1D7786E",
      methods: methods,
    },
  },
  [ronin.id]: {
    WETH: {
      address: "0x4006eD4097Ee51c09A04c3B0951D28CCf19e6DFE",
      methods: methods,
    },
  },
  [linea.id]: {
    USDC: {
      address: "0x8D38A3d6B3c3B7d96D6536DA7Eef94A9d7dbC991",
      methods: methods,
    },
  },
  [unichain.id]: {
    USDC: {
      address: "0x2c7118c4C88B9841FCF839074c26Ae8f035f2921",
      methods: methods,
    },
  },
};
