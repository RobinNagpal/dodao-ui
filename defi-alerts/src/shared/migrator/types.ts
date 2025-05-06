import { Abi, Address } from 'viem';

export interface FlattenedAddresses {
  core?: string;
  prime?: string;
  etherFi?: string;

  [key: string]: string | undefined;
}

export interface APY {
  stableBorrowAPY: string;
  supplyAPY: string;
  variableBorrowAPY: string;
}

export type Collateral = {
  symbol: string;
  tokenAddress: Address;
};

export interface UserReserve {
  apy: APY;
  asset: Address;
  balance: string;
  borrowBalanceUSD: number;
  debt: number;
  decimals: number;
  price: string;
  supplyBalanceUSD: number;
  symbol: string;
}

export interface CategorizedAssets {
  supplies: UserReserve[];
  borrows: UserReserve[];
}

export type MulticallRequest = {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: any[];
};

export interface FinancialData {
  // chainId?: number
  availableToBorrow: bigint;
  borrow: BorrowData;
  borrowCapacity: bigint;
  borrowPowerUsed: string;
  collateralValue: bigint;
  debt: bigint;
  healthFactor: string;
  liquidationBuffer: string;
  liquidationThreshold: string;
  maxSafeDebt: string;
  supply: SupplyData;
}

export interface Asset {
  aTokenAddress: Address;
  symbol: string;
  asset: Address;
  balance: string;
  borrowBalanceUSD: number;
  debt: number;
  decimals: number;
  price: string;
  supplyBalanceUSD: number;
  apy?: APY;
  originPrice: bigint;
  usageAsCollateralEnabled: boolean;
  variableDebtTokenAddress: Address;
}

export interface BorrowData {
  totalBorrowBalanceUSD: number;
  totalBorrowAPY: string;
  totalBalanceUSD: number;
  borrows: Asset[];
}

export interface SupplyData {
  totalSupplyBalanceUSD: number;
  totalSupplyAPY: string;
  totalBalanceUSD: number;
  supplies: Asset[];
}

export interface NestedResults {
  core?: FinancialData;
  prime?: FinancialData;
  etherFi?: FinancialData;

  [key: string]: FinancialData | undefined;
}

export interface AssetRates {
  asset: Address;
  supplyAPR: string;
  stableBorrowAPR: string;
  variableBorrowAPR: string;
}

export type APYData = {
  asset: Address;
  supplyAPY: string;
  stableBorrowAPY: string;
  variableBorrowAPY: string;
};

export interface ReserveData {
  asset: Address;
  liquidityRate: string;
  stableBorrowRate: string;
  variableBorrowRate: string;
}

export type ReserveDataTuple = [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  number,
];

export type UserReserveDataTuple = [
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  boolean,
];

export type UserAccountData = [bigint, bigint, bigint, bigint, bigint, bigint];

export type AddressResult = [Address, Address, Address];

// useAaveStore
export interface EthDataType {
  core?: FinancialData;
  etherFi?: FinancialData;
  prime?: FinancialData;
}

export interface RootDataType {
  chainId?: number;
  id?: string;
  data?: FinancialData | null;
}

export type FreeCollateralPosition = {
  id: string;
  tokenAmount: string;
  symbol: string;
  asset: Address;
  balance: string;
  decimals: number;
  aTokenAddress: Address;
  originPrice: bigint;
  supplyBalanceUSD: number;
};

// SubmitMigrate

export interface CollateralData {
  totalSupply: bigint;
  decimals: number;
  liquidateCollateralFactor: bigint;
  price: bigint;
}

export interface CalculateBPUParams {
  collaterals: CollateralData[];
  debt: number;
}

export interface QuoteResult {
  amountOut?: string;
  minAmountOut?: string;
  fee?: string;
  canSwap: boolean;
  needSwap?: boolean;
  pair?: [Address, Address];
  swapInfo?: SwapInfo;
  reason?: string;
}

export interface QuoteResults {
  [tokenSymbol: string]: QuoteResult;
}

// SwapInfo
interface SwapInfo {
  from: {
    token: Address;
    amount: string;
    decimals: number;
    formatted?: string;
    symbol: string;
    aTokenAddress: Address;
  };
  to: {
    token: Address;
    amount?: string;
    decimals: number;
    formatted?: string;
    symbol: string;
  };
  priceImpact?: string;
}

// useCompoundMigration

export interface TokenPosition {
  token: Address;
  aTokenAddress?: Address;
  amount: bigint;
  needSwap: boolean;
  swapTo?: Address;
  symbol?: string;
  fee?: string;
  decimals?: bigint;
  variableDebtTokenAddress?: Address;
  swapPath?: string;
}

export interface BorrowTokenPosition extends TokenPosition {
  swapAmount: bigint;
}

export interface Position {
  borrows: BorrowTokenPosition[];
  collaterals: TokenPosition[];
}

export interface SwapParams {
  path: Address;
  amountInMaximum?: bigint | number;
  amountOutMinimum?: bigint | number;
}

export interface FormattedBorrow {
  aDebtToken: Address;
  amount: bigint | string;
  swapParams: SwapParams;
}

export interface FormattedCollateral {
  aToken: Address;
  amount: bigint | string;
  swapParams: SwapParams;
}

export interface FormattedPosition {
  borrows: FormattedBorrow[];
  collaterals: FormattedCollateral[];
}

export interface ApproveState {
  token: Address;
  txHash?: Address;
  other?: TokenStatusType[];
}

export type CollateralOption = {
  token: Address;
  amount: bigint;
  decimals: bigint;
};

// store

export type TokenStatus = 'error' | 'pending' | 'approved' | 'loading' | 'locked';

export interface TokenPositionStore {
  token: Address;
  amount: bigint;
  needSwap: boolean;
  swapPath?: string;
  swapTo?: Address;
  symbol?: string;
  aTokenAddress?: Address;
  fee?: string;
  decimals?: bigint;
}

export interface TokenStatusType {
  token: Address;
  name: string;
  amount: bigint;
  status: TokenStatus;
  error?: string;
  decimals: bigint;
}

export type MigrationParams = {
  position: {
    borrows: BorrowTokenPosition[];
    collaterals: TokenPositionStore[];
  };
  flashAmount: bigint;
  needsApproval: boolean;
} | null;

//
export interface SwapTokenInfo {
  token: Address;
  amount: string;
  decimals: number;
  symbol: string;
}

export interface SwapInfoStore {
  from: SwapTokenInfo;
  to: SwapTokenInfo;
}

export interface BorrowQuote {
  amountOut: string;
  minAmountOut: string;
  fee: string;
  canSwap: boolean;
  isError: boolean;
  needSwap: boolean;
  swapPath: string;
  pair: [Address, Address];
  reason: string;
  swapInfo: SwapInfoStore;
}

export interface ICollateral {
  isLoading: boolean;
  isDisabled: boolean;
}

export type quoteResponse = {
  amountOut?: string;
  minAmountOut?: string;
  fee?: string | number;
  canSwap?: boolean;
  needSwap?: boolean;
  isError?: boolean;
  swapPath?: string;
  // pair: string[];
  reason?: string;
  swapInfo?: {
    from: {
      token: Address;
      amount?: string;
      decimals?: number;
    };
    to: {
      token?: string;
      amount?: string;
      decimals?: number;
    };
  };
};

export interface IBaseQuote {
  symbol: string;
  tokenAddress: Address;
  isLoading: boolean;
  isDisabled: boolean;
  variableDebtTokenAddress?: string;
  aTokenAddress?: `0x${string}`;
  aproveSymbol?: string;
  quoteResponse?: quoteResponse;
}

export interface CollateralState extends ICollateral {
  aTokenAddress?: `0x${string}`;
  aproveSymbol?: string;
  priceFeed?: string;
  borrowCollateralFactor?: bigint;
  liquidateCollateralFactor?: bigint;
  liquidationFactor?: bigint;
  supplyCap?: bigint;
  balanceOf?: bigint;
  allowance?: bigint;
  price?: bigint;
  totalSupply?: bigint;
  totalSupplyToken?: number;
  reserves?: bigint;
  id?: string;
  asset?: string;
  symbol?: string;
  decimals?: number;
  name?: string;
  icon?: string;
  value?: string;
  isMatching?: boolean;
  chainId?: number;
  quoteParams?: {
    chainId: number;
    tokenIn: Address;
    amount: string;
    tokenInDecimals: number;
    tokenOut: Address;
    tokenOutDecimals?: number;
    userAddress?: string;
    publicClient: any;
  };
  quoteResponse?: {
    amountOut?: string;
    minAmountOut?: string;
    fee?: string | number;
    canSwap?: boolean;
    needSwap?: boolean;
    isError?: boolean;
    pair?: (string | undefined)[];
    reason?: string;
    swapPath?: string;
    swapInfo?: {
      from: {
        token?: string;
        amount?: string;
        decimals?: number;
      };
      to: {
        token?: string;
        amount?: string;
        decimals?: number;
      };
    };
  };
}

export interface ICollateralOptions {
  id: string;
  name: string;
  symbol: string;
  asset: `0x${string}`;
  decimals: number;
  icon: string;
  totalSupply: bigint;
  totalSupplyToken: number;
  balanceOf: bigint;
  allowance: bigint;
  value: string;
  reserves: bigint;
  price: bigint;
  priceFeed: `0x${string}`;
  borrowCollateralFactor: bigint;
  liquidateCollateralFactor: bigint;
  liquidationFactor: bigint;
  supplyCap: bigint;
  chainId: number;
  isMatching: boolean;
}
