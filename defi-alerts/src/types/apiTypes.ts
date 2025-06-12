// Base market data interface
export interface BaseMarketData {
  chainId: number;
  chainName: string;
  asset: string;
  assetAddress: string;
  netEarnAPY: number;
  netBorrowAPY: number;
}

// Compound market APR data
export interface CompoundMarketApr extends BaseMarketData {
  supplyApr: number;
  borrowApr: number;
  supplyCompRewardApr: number;
  borrowCompRewardApr: number;
}

// Aave market APR data
export interface AaveMarketApr extends BaseMarketData {}

// Spark market APR data
export interface SparkMarketApr extends BaseMarketData {}

// Morpho vault APR data
export interface MorphoVaultApr extends BaseMarketData {
  vaultAddress: string;
  vaultName: string;
  vaultSymbol: string;
}

// Morpho market APR data
export interface MorphoMarketApr extends BaseMarketData {
  collateralAsset: string;
  collateralAddress: string;
  marketId: string;
  vaultName: string;
}

// API response interface for the test endpoint
export interface ApiResponse {
  sparkAprs: SparkMarketApr[];
  aaveAprs: AaveMarketApr[];
  compoundAprs: CompoundMarketApr[];
  morphoVaults: MorphoVaultApr[];
  morphoMarkets: MorphoMarketApr[];
}

// Market rate interface used in the UI
export interface MarketRate {
  platform: string;
  chainName: string;
  asset: string;
  earnRate: number;
  borrowRate: number;
  marketLink: string;
  vaultName?: string; // Optional for Morpho vaults
}
