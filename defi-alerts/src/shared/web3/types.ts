import { Address } from "viem";
import { usePublicClient } from "wagmi";
import { Chain } from "wagmi/chains";

import { ContractsName } from "./chainConfig";
import { supportedChainsId } from "./wagmiConfig";

export type SupportedChainId = (typeof supportedChainsId)[number];

export type Networks = Record<SupportedChainId, string>;
export type NetworksNative = Record<
  SupportedChainId,
  { name: string; symbol: string; decimals: number }
>;
export type Names = Record<string, SupportedChainId>;

export type ConfigTypes = {
  address: Address;
  methods: string[];
};

export type MARKET_ADDRESSES_TYPE = Record<
  SupportedChainId,
  { [key: string]: ConfigTypes }
>;
export type TOKEN_SYMBOLS_TYPE = Record<
  SupportedChainId,
  { [key: string]: string }
>;

export type HomePageDataType = {
  chainId: SupportedChainId;
  asset: string;
  decimals: number;
  totalEarning: number;
  totalBorrowed: number;
  totalAll: number;
  price: number;
  netBorrowAPY: number;
  netEarnAPY: number;
};

export type CollateralData = {
  asset: `0x${string}`;
  priceFeed: `0x${string}`;
  decimals: number;
  borrowCollateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
};

export type AllCollateralData = {
  symbol: string;
  allowance: bigint;
  balanceOf: bigint;
  price: bigint;
  totalSupply: bigint;
  totalSupplyToken: number;
  reserves: bigint;
} & CollateralData;

export interface TableData {
  chainId: SupportedChainId;
  asset: string;
  baseTokenAddress: Address;
  cometAddress: Address;
  baseTokenUserBalance: number;
  minBorrow: number;
  netEarnAPY: number;
  supplyApr: number;
  baseTotalSupply: number;
  supplyCompRewardApr: number;
  totalEarning: number;
  netBorrowAPY: number;
  borrowApr: number;
  borrowCompRewardApr: number;
  totalBorrowed: number;
  price: number;
  utility: number;
  borrowBalance: bigint;
  supplyBalance: bigint;
  decimals: bigint;
  totalReserves: bigint;
  availableLiquidity: bigint;
  configuratorData: AllCollateralData[];
  curveMetrics: {
    supplyKink: bigint;
    supplyPerSecondInterestRateBase: bigint;
    supplyPerSecondInterestRateSlopeLow: bigint;
    supplyPerSecondInterestRateSlopeHigh: bigint;
    borrowKink: bigint;
    borrowPerSecondInterestRateBase: bigint;
    borrowPerSecondInterestRateSlopeLow: bigint;
    borrowPerSecondInterestRateSlopeHigh: bigint;
  };
  // collaterals: CollateralData[];
}

export interface collateralsInputsData {
  inputValue: string;
  valueInComet: number;
  valueInMarketToken: number;
  price: number;
  address: Address;
  symbol: string;
  decimals: number;
  allowance: bigint;
  balanceOf: bigint;
  isEnoughSupply: boolean;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  totalSupply: bigint;
}

export interface ContractConfig {
  address: Address;
}

export type ConfigTypesSupply = {
  addressFrom: Address;
  addressTo: Address;
  bulker: Address;
  decimals: number;
  isNative: boolean;
  unique?: boolean;
};

export type StaticCallResponse = {
  request: {
    chain: Chain;
  };
  result: {
    token: Address;
    owed: bigint;
  };
};

export type CompTotalData = {
  chainId: SupportedChainId;
  result: number;
  resultAddress: Address;
  index: number;
};

export type Filters = { name: string; active: boolean; value: number };

export type Tokens = Record<
  SupportedChainId,
  { [key: string]: ConfigTypesSupply }
>;

export type ContractsNameType = keyof typeof ContractsName;

export type ContractByChainId = Record<SupportedChainId, ContractConfig>;

export type SortConfigType = {
  key: keyof TableData;
  direction: "ascending" | "descending";
} | null;

export type GetRateType = {
  utilization: bigint;
  kink: bigint;
  perSecondInterestRateBase: bigint;
  perSecondInterestRateSlopeLow: bigint;
  perSecondInterestRateSlopeHigh: bigint;
};

// useUniswapQuote

export interface QuoteParams {
  chainId: number;
  tokenIn: Address;
  tokenOut?: Address;
  amount?: string;
  amountOut?: string;
  tokenInDecimals?: number;
  tokenOutDecimals?: number;
  userAddress?: Address;
  publicClient: ReturnType<typeof usePublicClient>;
}

export interface UniswapContracts {
  factory: `0x${string}`;
  quoter: `0x${string}`;
}
