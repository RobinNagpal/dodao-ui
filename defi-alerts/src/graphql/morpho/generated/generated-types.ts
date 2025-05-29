import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** 42 character long hex address */
  Address: any;
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: any;
  /** Hexadecimal string */
  HexString: any;
  /** 66 character long hexadecimal market ID */
  MarketId: any;
}

export interface AddressDataPoint {
  __typename?: 'AddressDataPoint';
  x: Scalars['Float'];
  y?: Maybe<Scalars['Address']>;
}

export interface AddressMetadata {
  __typename?: 'AddressMetadata';
  metadata: Metadata;
  type: AddressMetadataType;
}

export enum AddressMetadataType {
  Aragon = 'aragon',
  Risk = 'risk',
  Safe = 'safe'
}

/** Risk address metadata */
export interface AddressRiskMetadata {
  __typename?: 'AddressRiskMetadata';
  isAuthorized: Scalars['Boolean'];
  risk: Scalars['String'];
  riskReason?: Maybe<Scalars['String']>;
}

/** Aragon address metadata */
export interface AragonAddressMetadata {
  __typename?: 'AragonAddressMetadata';
  description?: Maybe<Scalars['String']>;
  ensDomain?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
}

/** Asset */
export interface Asset {
  __typename?: 'Asset';
  /** ERC-20 token contract address */
  address: Scalars['Address'];
  chain: Chain;
  decimals: Scalars['Float'];
  /** Historical price in USD, for display purpose */
  historicalPriceUsd?: Maybe<Array<FloatDataPoint>>;
  /** Historical spot price in ETH */
  historicalSpotPriceEth?: Maybe<Array<FloatDataPoint>>;
  id: Scalars['ID'];
  /** Either the asset is whitelisted or not */
  isWhitelisted: Scalars['Boolean'];
  /** Token logo URI, for display purpose */
  logoURI?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  /** Current oracle price in USD, for display purpose. */
  oraclePriceUsd?: Maybe<Scalars['Float']>;
  /** Current price in USD, for display purpose. */
  priceUsd?: Maybe<Scalars['Float']>;
  /** Risk related data on the asset */
  riskAnalysis?: Maybe<Array<RiskAnalysis>>;
  /** Current spot price in ETH. */
  spotPriceEth?: Maybe<Scalars['Float']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Scalars['String']>>;
  /**
   * ERC-20 token total supply
   * @deprecated this data is not updated anymore
   */
  totalSupply: Scalars['BigInt'];
  /** MetaMorpho vault */
  vault?: Maybe<Vault>;
  /** Asset yield */
  yield?: Maybe<AssetYield>;
}


/** Asset */
export interface AssetHistoricalPriceUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Asset */
export interface AssetHistoricalSpotPriceEthArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Asset */
export interface AssetOraclePriceUsdArgs {
  timestamp?: InputMaybe<Scalars['Float']>;
}


/** Asset */
export interface AssetSpotPriceEthArgs {
  timestamp?: InputMaybe<Scalars['Float']>;
}

export enum AssetOrderBy {
  Address = 'Address',
  CredoraRiskScore = 'CredoraRiskScore'
}

/** Asset yield */
export interface AssetYield {
  __typename?: 'AssetYield';
  /** Asset yield (APR) */
  apr: Scalars['Float'];
}

export interface AssetsFilters {
  /** Filter by token contract address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by credora risk score greater than or equal to given value */
  credoraRiskScore_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by credora risk score lower than or equal to given value */
  credoraRiskScore_lte?: InputMaybe<Scalars['Float']>;
  /** Filter assets that are listed by specific curators */
  curator_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by asset id */
  id_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter assets that are listed as collateral on at least one market */
  isCollateralAsset?: InputMaybe<Scalars['Boolean']>;
  /** Filter assets that are listed as loan on at least one market */
  isLoanAsset?: InputMaybe<Scalars['Boolean']>;
  /** Filter assets that are listed by at least one vault */
  isVaultAsset?: InputMaybe<Scalars['Boolean']>;
  search?: InputMaybe<Scalars['String']>;
  /** Filter by token symbol */
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by token's tags */
  tags_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by whitelisted status */
  whitelisted?: InputMaybe<Scalars['Boolean']>;
}

export interface BigIntDataPoint {
  __typename?: 'BigIntDataPoint';
  x: Scalars['Float'];
  y?: Maybe<Scalars['BigInt']>;
}

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

/** Event data for cap-related operation */
export interface CapEventData {
  __typename?: 'CapEventData';
  cap: Scalars['BigInt'];
  market: Market;
}

/** Chain */
export interface Chain {
  __typename?: 'Chain';
  currency: Scalars['String'];
  id: Scalars['Int'];
  network: Scalars['String'];
}

/** Chain synchronization state */
export interface ChainSynchronizationState {
  __typename?: 'ChainSynchronizationState';
  blockNumber: Scalars['BigInt'];
  chain: Chain;
  id: Scalars['ID'];
  key: Scalars['String'];
}

/** Oracle creation tx */
export interface ChainlinkOracleV2Event {
  __typename?: 'ChainlinkOracleV2Event';
  blockNumber: Scalars['BigInt'];
  chainId: Scalars['Int'];
  timestamp: Scalars['BigInt'];
  txHash: Scalars['HexString'];
}

/** Amount of collateral at risk of liquidation at collateralPriceRatio * oracle price */
export interface CollateralAtRiskDataPoint {
  __typename?: 'CollateralAtRiskDataPoint';
  collateralAssets: Scalars['BigInt'];
  collateralPriceRatio: Scalars['Float'];
  collateralUsd: Scalars['Float'];
}

/** Credora risk analysis */
export interface CredoraRiskAnalysis {
  __typename?: 'CredoraRiskAnalysis';
  isUnderReview: Scalars['Boolean'];
  rating?: Maybe<Scalars['String']>;
  score: Scalars['Float'];
  timestamp: Scalars['Float'];
}

/** Vault curator */
export interface Curator {
  __typename?: 'Curator';
  addresses: Array<CuratorAddress>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  /** Curator logo URI, for display purpose */
  image?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  socials: Array<CuratorSocial>;
  /** Current state */
  state?: Maybe<CuratorState>;
  /**
   * Link to curator website
   * @deprecated Use `socials` instead
   */
  url?: Maybe<Scalars['String']>;
  verified: Scalars['Boolean'];
}

/** Curator Address */
export interface CuratorAddress {
  __typename?: 'CuratorAddress';
  address: Scalars['String'];
  chainId: Scalars['Int'];
  /** Additional information about the address. */
  metadata?: Maybe<PaginatedAddressMetadata>;
}

/** Filtering options for curators. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface CuratorFilters {
  address_in?: InputMaybe<Array<Scalars['String']>>;
  chainId?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  verified?: InputMaybe<Scalars['Boolean']>;
}

export interface CuratorSocial {
  __typename?: 'CuratorSocial';
  type: Scalars['String'];
  url: Scalars['String'];
}

/** Vault curator state */
export interface CuratorState {
  __typename?: 'CuratorState';
  /**
   * Assets Under Management. Total assets managed by the curator, in USD for display purpose.
   * @deprecated Work in progress
   */
  aum: Scalars['Float'];
  curatorId: Scalars['ID'];
}

/** Custom Warning Metadata */
export interface CustomMetadata {
  __typename?: 'CustomMetadata';
  content?: Maybe<Scalars['String']>;
}

export interface FloatDataPoint {
  __typename?: 'FloatDataPoint';
  x: Scalars['Float'];
  y?: Maybe<Scalars['Float']>;
}

/** Hardcoded Price Metadata */
export interface HardcodedPriceMetadata {
  __typename?: 'HardcodedPriceMetadata';
  symbolFrom?: Maybe<Scalars['String']>;
  symbolTo?: Maybe<Scalars['String']>;
}

/** IRM curve data point */
export interface IrmCurveDataPoint {
  __typename?: 'IRMCurveDataPoint';
  /** Borrow APY at utilization rate */
  borrowApy: Scalars['Float'];
  /** Supply APY at utilization rate */
  supplyApy: Scalars['Float'];
  /** Market utilization rate */
  utilization: Scalars['Float'];
}

export interface IntDataPoint {
  __typename?: 'IntDataPoint';
  x: Scalars['Float'];
  y?: Maybe<Scalars['Int']>;
}

/** Morpho Blue market */
export interface Market {
  __typename?: 'Market';
  /** All time market APYs */
  allTimeApys?: Maybe<MarketApyAggregates>;
  /** Market bad debt values */
  badDebt?: Maybe<MarketBadDebt>;
  collateralAsset?: Maybe<Asset>;
  /**
   * Amount of collateral to borrow 1 loan asset scaled to both asset decimals
   * @deprecated Use `state.price` instead.
   */
  collateralPrice?: Maybe<Scalars['BigInt']>;
  /** Market concentrations */
  concentration?: Maybe<MarketConcentration>;
  creationBlockNumber: Scalars['Int'];
  creationTimestamp: Scalars['BigInt'];
  creatorAddress?: Maybe<Scalars['Address']>;
  /** Current IRM curve at different utilization thresholds for display purpose */
  currentIrmCurve?: Maybe<Array<IrmCurveDataPoint>>;
  /** Daily market APYs */
  dailyApys?: Maybe<MarketApyAggregates>;
  /** State history */
  historicalState?: Maybe<MarketHistory>;
  id: Scalars['ID'];
  irmAddress: Scalars['Address'];
  lltv: Scalars['BigInt'];
  loanAsset: Asset;
  /** Monthly market APYs */
  monthlyApys?: Maybe<MarketApyAggregates>;
  morphoBlue: MorphoBlue;
  oracle?: Maybe<Oracle>;
  oracleAddress: Scalars['Address'];
  /** Feeds used by the oracle if provided by the contract */
  oracleFeed?: Maybe<MarketOracleFeed>;
  /** Market oracle information */
  oracleInfo?: Maybe<MarketOracleInfo>;
  /** Public allocator shared liquidity available reallocations */
  publicAllocatorSharedLiquidity?: Maybe<Array<PublicAllocatorSharedLiquidity>>;
  /** Quarterly market APYs */
  quarterlyApys?: Maybe<MarketApyAggregates>;
  /** Market realized bad debt values */
  realizedBadDebt?: Maybe<MarketBadDebt>;
  /** Underlying amount of assets that can be reallocated to this market */
  reallocatableLiquidityAssets?: Maybe<Scalars['BigInt']>;
  /** Risk related data on the market */
  riskAnalysis?: Maybe<Array<RiskAnalysis>>;
  /** Current state */
  state?: Maybe<MarketState>;
  /** Vaults with the market in supply queue */
  supplyingVaults?: Maybe<Array<Vault>>;
  targetBorrowUtilization: Scalars['BigInt'];
  targetWithdrawUtilization: Scalars['BigInt'];
  uniqueKey: Scalars['MarketId'];
  /** Market warnings */
  warnings?: Maybe<Array<MarketWarning>>;
  /** Weekly market APYs */
  weeklyApys?: Maybe<MarketApyAggregates>;
  whitelisted: Scalars['Boolean'];
  /** Yearly market APYs */
  yearlyApys?: Maybe<MarketApyAggregates>;
}


/** Morpho Blue market */
export interface MarketCurrentIrmCurveArgs {
  numberOfPoints?: InputMaybe<Scalars['Float']>;
}

/** Market APY aggregates */
export interface MarketApyAggregates {
  __typename?: 'MarketApyAggregates';
  /** Average market borrow APY excluding rewards */
  borrowApy?: Maybe<Scalars['Float']>;
  /** Average market borrow APY including rewards */
  netBorrowApy?: Maybe<Scalars['Float']>;
  /** Average market supply APY including rewards */
  netSupplyApy?: Maybe<Scalars['Float']>;
  /** Average market supply APY excluding rewards */
  supplyApy?: Maybe<Scalars['Float']>;
}

/** Bad debt realized in the market */
export interface MarketBadDebt {
  __typename?: 'MarketBadDebt';
  /** Amount of bad debt realized in the market in underlying units. */
  underlying: Scalars['BigInt'];
  /** Amount of bad debt realized in the market in USD. */
  usd?: Maybe<Scalars['Float']>;
}

/** Market collateral at risk of liquidation */
export interface MarketCollateralAtRisk {
  __typename?: 'MarketCollateralAtRisk';
  /** Total collateral at risk of liquidation at certain prices thresholds. */
  collateralAtRisk?: Maybe<Array<CollateralAtRiskDataPoint>>;
  market: Market;
}

/** Market collateral transfer transaction data */
export interface MarketCollateralTransferTransactionData {
  __typename?: 'MarketCollateralTransferTransactionData';
  assets: Scalars['BigInt'];
  assetsUsd?: Maybe<Scalars['Float']>;
  market: Market;
}

/** Morpho Blue supply and borrow side concentrations */
export interface MarketConcentration {
  __typename?: 'MarketConcentration';
  /** Borrowers Herfindahl-Hirschman Index */
  borrowHhi?: Maybe<Scalars['Float']>;
  /** Borrowers Herfindahl-Hirschman Index */
  supplyHhi?: Maybe<Scalars['Float']>;
}

/** Filtering options for markets. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface MarketFilters {
  /** Filter by greater than or equal to given apy at target utilization */
  apyAtTarget_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given apy at target utilization */
  apyAtTarget_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given borrow APY */
  borrowApy_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given borrow APY */
  borrowApy_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given borrow asset amount, in USD. */
  borrowAssetsUsd_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given borrow asset amount, in USD. */
  borrowAssetsUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given borrow asset amount, in underlying token units. */
  borrowAssets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given borrow asset amount, in underlying token units. */
  borrowAssets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given borrow shares amount */
  borrowShares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given borrow shares amount */
  borrowShares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by collateral asset address. Case insensitive. */
  collateralAssetAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by collateral asset id */
  collateralAssetId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by collateral asset tags. */
  collateralAssetTags_in?: InputMaybe<Array<Scalars['String']>>;
  countryCode?: InputMaybe<Scalars['String']>;
  /** Filter by credora risk score greater than or equal to given value */
  credoraRiskScore_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by credora risk score lower than or equal to given value */
  credoraRiskScore_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given fee rate */
  fee_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given fee rate */
  fee_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by market id */
  id_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market irm address */
  irmAddress_in?: InputMaybe<Array<Scalars['String']>>;
  isIdle?: InputMaybe<Scalars['Boolean']>;
  /** Filter by greater than or equal to given lltv */
  lltv_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given lltv */
  lltv_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by loan asset address. Case insensitive. */
  loanAssetAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by loan asset id */
  loanAssetId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by loan asset tags. */
  loanAssetTags_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given net borrow APY */
  netBorrowApy_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given net borrow APY */
  netBorrowApy_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given net supply APY */
  netSupplyApy_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given net supply APY */
  netSupplyApy_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by market oracle address. Case insensitive. */
  oracleAddress_in?: InputMaybe<Array<Scalars['String']>>;
  search?: InputMaybe<Scalars['String']>;
  /** Filter by greater than or equal to given supply APY */
  supplyApy_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given supply APY */
  supplyApy_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given supply asset amount, in USD. */
  supplyAssetsUsd_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given supply asset amount, in USD. */
  supplyAssetsUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given supply asset amount, in underlying token units. */
  supplyAssets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given supply asset amount, in underlying token units. */
  supplyAssets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given supply shares amount */
  supplyShares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given borrow shares amount */
  supplyShares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by market unique key */
  uniqueKey_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given utilization rate */
  utilization_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given utilization rate */
  utilization_lte?: InputMaybe<Scalars['Float']>;
  whitelisted?: InputMaybe<Scalars['Boolean']>;
}

/** Market state history */
export interface MarketHistory {
  __typename?: 'MarketHistory';
  /** All Time Borrow APY excluding rewards */
  allTimeBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** All Time Borrow APY including rewards */
  allTimeNetBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** All Time Supply APY including rewards */
  allTimeNetSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** All Time Supply APY excluding rewards */
  allTimeSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** AdaptiveCurveIRM APY if utilization was at target */
  apyAtTarget?: Maybe<Array<FloatDataPoint>>;
  /** Borrow APY excluding rewards */
  borrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Amount borrowed on the market, in underlying units. Amount increases as interests accrue. */
  borrowAssets?: Maybe<Array<BigIntDataPoint>>;
  /** Amount borrowed on the market, in USD for display purpose */
  borrowAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Amount borrowed on the market, in market share units. Amount does not increase as interest accrue. */
  borrowShares?: Maybe<Array<BigIntDataPoint>>;
  /** Amount of collateral in the market, in underlying units */
  collateralAssets?: Maybe<Array<BigIntDataPoint>>;
  /** Amount of collateral in the market, in USD for display purpose */
  collateralAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Daily Borrow APY excluding rewards */
  dailyBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Daily Borrow APY including rewards */
  dailyNetBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Daily Supply APY including rewards */
  dailyNetSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Daily Supply APY excluding rewards */
  dailySupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Fee rate */
  fee?: Maybe<Array<FloatDataPoint>>;
  /** Amount available to borrow on the market, in underlying units */
  liquidityAssets?: Maybe<Array<BigIntDataPoint>>;
  /** Amount available to borrow on the market, in USD for display purpose */
  liquidityAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Monthly Borrow APY excluding rewards */
  monthlyBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Monthly Borrow APY including rewards */
  monthlyNetBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Monthly Supply APY including rewards */
  monthlyNetSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Monthly Supply APY excluding rewards */
  monthlySupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Supply APY including rewards */
  netBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Supply APY including rewards */
  netSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Collateral price */
  price?: Maybe<Array<FloatDataPoint>>;
  /** Quarterly Borrow APY excluding rewards */
  quarterlyBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Quarterly Borrow APY including rewards */
  quarterlyNetBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Quarterly Supply APY including rewards */
  quarterlyNetSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Quarterly Supply APY excluding rewards */
  quarterlySupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** AdaptiveCurveIRM rate per second if utilization was at target */
  rateAtTarget?: Maybe<Array<BigIntDataPoint>>;
  /**
   * AdaptiveCurveIRM APY if utilization was at target
   * @deprecated Use `apyAtTarget` instead
   */
  rateAtUTarget?: Maybe<Array<FloatDataPoint>>;
  /** Supply APY excluding rewards */
  supplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Amount supplied on the market, in underlying units. Amount increases as interests accrue. */
  supplyAssets?: Maybe<Array<BigIntDataPoint>>;
  /** Amount supplied on the market, in USD for display purpose */
  supplyAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Amount supplied on the market, in market share units. Amount does not increase as interest accrue. */
  supplyShares?: Maybe<Array<BigIntDataPoint>>;
  /** Utilization rate */
  utilization?: Maybe<Array<FloatDataPoint>>;
  /** Weekly Borrow APY excluding rewards */
  weeklyBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Weekly Borrow APY including rewards */
  weeklyNetBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Weekly Supply APY including rewards */
  weeklyNetSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Weekly Supply APY excluding rewards */
  weeklySupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Yearly Borrow APY excluding rewards */
  yearlyBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Yearly Borrow APY including rewards */
  yearlyNetBorrowApy?: Maybe<Array<FloatDataPoint>>;
  /** Yearly Supply APY including rewards */
  yearlyNetSupplyApy?: Maybe<Array<FloatDataPoint>>;
  /** Yearly Supply APY excluding rewards */
  yearlySupplyApy?: Maybe<Array<FloatDataPoint>>;
}


/** Market state history */
export interface MarketHistoryAllTimeBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryAllTimeNetBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryAllTimeNetSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryAllTimeSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryApyAtTargetArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryBorrowAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryBorrowAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryBorrowSharesArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryCollateralAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryCollateralAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryDailyBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryDailyNetBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryDailyNetSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryDailySupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryFeeArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryLiquidityAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryLiquidityAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryMonthlyBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryMonthlyNetBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryMonthlyNetSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryMonthlySupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryNetBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryNetSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryPriceArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryQuarterlyBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryQuarterlyNetBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryQuarterlyNetSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryQuarterlySupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryRateAtTargetArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryRateAtUTargetArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistorySupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistorySupplyAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistorySupplyAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistorySupplySharesArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryUtilizationArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryWeeklyBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryWeeklyNetBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryWeeklyNetSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryWeeklySupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryYearlyBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryYearlyNetBorrowApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryYearlyNetSupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market state history */
export interface MarketHistoryYearlySupplyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}

/** Market liquidation transaction data */
export interface MarketLiquidationTransactionData {
  __typename?: 'MarketLiquidationTransactionData';
  badDebtAssets: Scalars['BigInt'];
  badDebtAssetsUsd?: Maybe<Scalars['Float']>;
  badDebtShares: Scalars['BigInt'];
  liquidator: Scalars['Address'];
  market: Market;
  repaidAssets: Scalars['BigInt'];
  repaidAssetsUsd?: Maybe<Scalars['Float']>;
  repaidShares: Scalars['BigInt'];
  seizedAssets: Scalars['BigInt'];
  seizedAssetsUsd?: Maybe<Scalars['Float']>;
}

/** Market oracle accuracy versus spot price */
export interface MarketOracleAccuracy {
  __typename?: 'MarketOracleAccuracy';
  /**
   * Average oracle/spot prices deviation
   * @deprecated Not maintained anymore.
   */
  averagePercentDifference?: Maybe<Scalars['Float']>;
  market: Market;
  /**
   * Maximum oracle/spot prices deviation
   * @deprecated Not maintained anymore.
   */
  maxPercentDifference?: Maybe<Scalars['Float']>;
}

/** Market oracle feeds */
export interface MarketOracleFeed {
  __typename?: 'MarketOracleFeed';
  baseFeedOneAddress: Scalars['Address'];
  baseFeedOneDescription?: Maybe<Scalars['String']>;
  baseFeedOneVendor?: Maybe<Scalars['String']>;
  baseFeedTwoAddress: Scalars['Address'];
  baseFeedTwoDescription?: Maybe<Scalars['String']>;
  baseFeedTwoVendor?: Maybe<Scalars['String']>;
  baseVault?: Maybe<Scalars['Address']>;
  baseVaultConversionSample?: Maybe<Scalars['BigInt']>;
  baseVaultDescription?: Maybe<Scalars['String']>;
  baseVaultVendor?: Maybe<Scalars['String']>;
  quoteFeedOneAddress: Scalars['Address'];
  quoteFeedOneDescription?: Maybe<Scalars['String']>;
  quoteFeedOneVendor?: Maybe<Scalars['String']>;
  quoteFeedTwoAddress: Scalars['Address'];
  quoteFeedTwoDescription?: Maybe<Scalars['String']>;
  quoteFeedTwoVendor?: Maybe<Scalars['String']>;
  quoteVault?: Maybe<Scalars['Address']>;
  quoteVaultConversionSample?: Maybe<Scalars['BigInt']>;
  quoteVaultDescription?: Maybe<Scalars['String']>;
  quoteVaultVendor?: Maybe<Scalars['String']>;
  scaleFactor?: Maybe<Scalars['BigInt']>;
}

/** Market oracle information */
export interface MarketOracleInfo {
  __typename?: 'MarketOracleInfo';
  type: OracleType;
}

export enum MarketOrderBy {
  ApyAtTarget = 'ApyAtTarget',
  BorrowApy = 'BorrowApy',
  BorrowAssets = 'BorrowAssets',
  BorrowAssetsUsd = 'BorrowAssetsUsd',
  BorrowShares = 'BorrowShares',
  CollateralAssetSymbol = 'CollateralAssetSymbol',
  CredoraRiskScore = 'CredoraRiskScore',
  DailyBorrowApy = 'DailyBorrowApy',
  DailyNetBorrowApy = 'DailyNetBorrowApy',
  Fee = 'Fee',
  Lltv = 'Lltv',
  LoanAssetSymbol = 'LoanAssetSymbol',
  NetBorrowApy = 'NetBorrowApy',
  NetSupplyApy = 'NetSupplyApy',
  RateAtUTarget = 'RateAtUTarget',
  SizeUsd = 'SizeUsd',
  SupplyApy = 'SupplyApy',
  SupplyAssets = 'SupplyAssets',
  SupplyAssetsUsd = 'SupplyAssetsUsd',
  SupplyShares = 'SupplyShares',
  TotalLiquidityUsd = 'TotalLiquidityUsd',
  UniqueKey = 'UniqueKey',
  Utilization = 'Utilization'
}

/** Market position */
export interface MarketPosition {
  __typename?: 'MarketPosition';
  /**
   * Amount of loan asset borrowed, in underlying token units.
   * @deprecated Use `state.borrowAssets` instead.
   */
  borrowAssets: Scalars['BigInt'];
  /**
   * Amount of loan asset borrowed, in USD for display purpose.
   * @deprecated Use `state.borrowAssetsUsd` instead.
   */
  borrowAssetsUsd?: Maybe<Scalars['Float']>;
  /**
   * Amount of loan asset borrowed, in market shares.
   * @deprecated Use `state.borrowShares` instead.
   */
  borrowShares: Scalars['BigInt'];
  /**
   * Amount of collateral asset deposited on the market, in underlying token units.
   * @deprecated Use `state.collateral` instead.
   */
  collateral: Scalars['BigInt'];
  /**
   * Amount of collateral asset deposited on the market, in USD for display purpose.
   * @deprecated Use `state.collateralUsd` instead.
   */
  collateralUsd?: Maybe<Scalars['Float']>;
  /** Health factor of the position, computed as collateral value divided by borrow value. */
  healthFactor?: Maybe<Scalars['Float']>;
  /** State history */
  historicalState?: Maybe<MarketPositionHistory>;
  id: Scalars['ID'];
  market: Market;
  /** Price variation required for the given position to reach its liquidation threshold (scaled by WAD) */
  priceVariationToLiquidationPrice?: Maybe<Scalars['Float']>;
  /** Current state */
  state?: Maybe<MarketPositionState>;
  /**
   * Amount of loan asset supplied, in underlying token units.
   * @deprecated Use `state.supplyAssets` instead.
   */
  supplyAssets: Scalars['BigInt'];
  /**
   * Amount of loan asset supplied, in USD for display purpose.
   * @deprecated Use `state.supplyAssetsUsd` instead.
   */
  supplyAssetsUsd?: Maybe<Scalars['Float']>;
  /**
   * Amount of loan asset supplied, in market shares.
   * @deprecated Use `state.supplyShares` instead.
   */
  supplyShares: Scalars['BigInt'];
  user: User;
}

/** Filtering options for market positions. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface MarketPositionFilters {
  /** Filter by greater than or equal to given borrow shares */
  borrowShares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given borrow shares */
  borrowShares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by greater than or equal to given collateral amount, in underlying token units. */
  collateral_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given collateral amount, in underlying token units. */
  collateral_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given health factor */
  healthFactor_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given health factor */
  healthFactor_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars['String']>>;
  search?: InputMaybe<Scalars['String']>;
  /** Filter by greater than or equal to given supply shares */
  supplyShares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given supply shares */
  supplyShares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by user address. Case insensitive. */
  userAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by user id */
  userId_in?: InputMaybe<Array<Scalars['String']>>;
}

/** Market position state history */
export interface MarketPositionHistory {
  __typename?: 'MarketPositionHistory';
  /** Borrow assets history. */
  borrowAssets?: Maybe<Array<BigIntDataPoint>>;
  /** Borrow assets history, in USD. */
  borrowAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the borrow side of the position since its inception, in loan assets. */
  borrowPnl?: Maybe<Array<BigIntDataPoint>>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the borrow side of the position since its inception, in USD for display purpose. */
  borrowPnlUsd?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history of the borrow side of the position. */
  borrowRoe?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history of the borrow side of the position, taking into account the loan asset's price variation. */
  borrowRoeUsd?: Maybe<Array<FloatDataPoint>>;
  /** Borrow shares history. */
  borrowShares?: Maybe<Array<BigIntDataPoint>>;
  /** Collateral history. */
  collateral?: Maybe<Array<BigIntDataPoint>>;
  /** Profit & Loss (from the collateral asset's price variation) of the collateral of the position since its inception, in USD for display purpose. */
  collateralPnlUsd?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history of the collateral of the position, taking into account the collateral asset's price variation. */
  collateralRoeUsd?: Maybe<Array<FloatDataPoint>>;
  /** Collateral value history, in USD. */
  collateralUsd?: Maybe<Array<FloatDataPoint>>;
  /** Collateral value history, in loan assets. */
  collateralValue?: Maybe<Array<BigIntDataPoint>>;
  /** Margin history, in loan assets. */
  margin?: Maybe<Array<BigIntDataPoint>>;
  /** Profit & Loss (from the assets' price variation and loan interest) of the margin of the position since its inception, in loan assets. */
  marginPnl?: Maybe<Array<BigIntDataPoint>>;
  /** Profit & Loss (from the collateral asset's price variation and loan interest) of the margin of the position since its inception, in USD for display purpose. */
  marginPnlUsd?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history of the margin of the position. */
  marginRoe?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history of the margin of the position, taking into account prices variation. */
  marginRoeUsd?: Maybe<Array<FloatDataPoint>>;
  /** Margin history, in USD. */
  marginUsd?: Maybe<Array<FloatDataPoint>>;
  /** Profit (from the collateral asset's price variation) & Loss (from the loan interest) history, in loan assets. */
  pnl?: Maybe<Array<BigIntDataPoint>>;
  /** Profit (from the collateral asset's price variation) & Loss (from the loan interest) history, in USD for display purposes. */
  pnlUsd?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history. */
  roe?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history, taking into account prices variation. */
  roeUsd?: Maybe<Array<FloatDataPoint>>;
  /** Supply assets history. */
  supplyAssets?: Maybe<Array<BigIntDataPoint>>;
  /** Supply assets history, in USD. */
  supplyAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the supply side of the position since its inception, in loan assets. */
  supplyPnl?: Maybe<Array<BigIntDataPoint>>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the supply side of the position since its inception, in USD for display purpose. */
  supplyPnlUsd?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history of the supply side of the position. */
  supplyRoe?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity history of the supply side of the position, taking into account the loan asset's price variation. */
  supplyRoeUsd?: Maybe<Array<FloatDataPoint>>;
  /** Supply shares history. */
  supplyShares?: Maybe<Array<BigIntDataPoint>>;
}


/** Market position state history */
export interface MarketPositionHistoryBorrowAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryBorrowAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryBorrowPnlArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryBorrowPnlUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryBorrowRoeArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryBorrowRoeUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryBorrowSharesArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryCollateralArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryCollateralPnlUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryCollateralRoeUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryCollateralUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryCollateralValueArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryMarginArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryMarginPnlArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryMarginPnlUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryMarginRoeArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryMarginRoeUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryMarginUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryPnlArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryPnlUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryRoeArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistoryRoeUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistorySupplyAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistorySupplyAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistorySupplyPnlArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistorySupplyPnlUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistorySupplyRoeArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistorySupplyRoeUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Market position state history */
export interface MarketPositionHistorySupplySharesArgs {
  options?: InputMaybe<TimeseriesOptions>;
}

export enum MarketPositionOrderBy {
  BorrowShares = 'BorrowShares',
  Collateral = 'Collateral',
  HealthFactor = 'HealthFactor',
  SupplyShares = 'SupplyShares'
}

/** Market position state */
export interface MarketPositionState {
  __typename?: 'MarketPositionState';
  /** The latest borrow assets indexed for this position. */
  borrowAssets?: Maybe<Scalars['BigInt']>;
  /** The latest borrow assets indexed for this position, in USD. */
  borrowAssetsUsd?: Maybe<Scalars['Float']>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the borrow side of the position since its inception, in loan assets. */
  borrowPnl?: Maybe<Scalars['BigInt']>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the borrow side of the position since its inception, in USD for display purpose. */
  borrowPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the borrow side of the position since its inception. */
  borrowRoe?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the borrow side of the position since its inception, taking into account the loan asset's price variation. */
  borrowRoeUsd?: Maybe<Scalars['Float']>;
  /** The latest borrow shares indexed for this position. */
  borrowShares: Scalars['BigInt'];
  /** The latest collateral assets indexed for this position. */
  collateral: Scalars['BigInt'];
  /** Profit & Loss (from the collateral asset's price variation) of the collateral of the position since its inception, in USD for display purpose. */
  collateralPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the collateral of the position since its inception, taking into account the collateral asset's price variation. */
  collateralRoeUsd?: Maybe<Scalars['Float']>;
  /** The latest collateral assets indexed for this position, in USD. */
  collateralUsd?: Maybe<Scalars['Float']>;
  /** The latest collateral assets indexed for this position, in loan assets. */
  collateralValue?: Maybe<Scalars['BigInt']>;
  id: Scalars['ID'];
  /** The latest margin indexed for this position, in loan assets. */
  margin?: Maybe<Scalars['BigInt']>;
  /** Profit & Loss (from the assets' price variation and loan interest) of the margin of the position since its inception, in loan assets. */
  marginPnl?: Maybe<Scalars['BigInt']>;
  /** Profit & Loss (from the collateral asset's price variation and loan interest) of the margin of the position since its inception, in USD for display purpose. */
  marginPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the margin of the position since its inception. */
  marginRoe?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the margin of the position since its inception, taking into account prices variation. */
  marginRoeUsd?: Maybe<Scalars['Float']>;
  /** The latest margin indexed for this position, in USD. */
  marginUsd?: Maybe<Scalars['Float']>;
  /** Profit (from the collateral asset's price variation) & Loss (from the loan interest) of the position since its inception, in loan assets. */
  pnl?: Maybe<Scalars['BigInt']>;
  /** Profit (from the collateral asset's price variation) & Loss (from the loan interest) of the position since its inception, in USD for display purpose. */
  pnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the position since its inception. */
  roe?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the position since its inception, taking into account prices variation. */
  roeUsd?: Maybe<Scalars['Float']>;
  /** The latest supply assets indexed for this position. */
  supplyAssets?: Maybe<Scalars['BigInt']>;
  /** The latest supply assets indexed for this position, in USD. */
  supplyAssetsUsd?: Maybe<Scalars['Float']>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the supply side of the position since its inception, in loan assets. */
  supplyPnl?: Maybe<Scalars['BigInt']>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the supply side of the position since its inception, in USD for display purpose. */
  supplyPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the supply side of the position since its inception. */
  supplyRoe?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the supply side of the position since its inception, taking into account the loan asset's price variation. */
  supplyRoeUsd?: Maybe<Scalars['Float']>;
  /** The latest supply shares indexed for this position. */
  supplyShares: Scalars['BigInt'];
  /** The latest update timestamp. */
  timestamp: Scalars['BigInt'];
}

/** Morpho Blue market state */
export interface MarketState {
  __typename?: 'MarketState';
  /** All Time Borrow APY excluding rewards */
  allTimeBorrowApy?: Maybe<Scalars['Float']>;
  /** All Time Borrow APY including rewards */
  allTimeNetBorrowApy?: Maybe<Scalars['Float']>;
  /** All Time Supply APY including rewards */
  allTimeNetSupplyApy?: Maybe<Scalars['Float']>;
  /** All Time Supply APY excluding rewards */
  allTimeSupplyApy?: Maybe<Scalars['Float']>;
  /** Apy at target utilization */
  apyAtTarget: Scalars['Float'];
  /** Block number of the state */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Instantaneous Borrow APY */
  borrowApy: Scalars['Float'];
  /** Amount borrowed on the market, in underlying units. Amount increases as interests accrue. */
  borrowAssets: Scalars['BigInt'];
  /** Amount borrowed on the market, in USD for display purpose */
  borrowAssetsUsd?: Maybe<Scalars['Float']>;
  /** Amount borrowed on the market, in market share units. Amount does not increase as interest accrue. */
  borrowShares: Scalars['BigInt'];
  /** Amount of collateral in the market, in underlying units */
  collateralAssets?: Maybe<Scalars['BigInt']>;
  /** Amount of collateral in the market, in USD for display purpose */
  collateralAssetsUsd?: Maybe<Scalars['Float']>;
  /** Daily Borrow APY excluding rewards */
  dailyBorrowApy?: Maybe<Scalars['Float']>;
  /** Daily Borrow APY including rewards */
  dailyNetBorrowApy?: Maybe<Scalars['Float']>;
  /** Daily Supply APY including rewards */
  dailyNetSupplyApy?: Maybe<Scalars['Float']>;
  /** Variation of the collateral price over the last 24 hours */
  dailyPriceVariation?: Maybe<Scalars['Float']>;
  /** Daily Supply APY excluding rewards */
  dailySupplyApy?: Maybe<Scalars['Float']>;
  /** Fee rate */
  fee: Scalars['Float'];
  id: Scalars['ID'];
  /** Amount available to borrow on the market, in underlying units */
  liquidityAssets: Scalars['BigInt'];
  /** Amount available to borrow on the market, in USD for display purpose */
  liquidityAssetsUsd?: Maybe<Scalars['Float']>;
  /** Monthly Borrow APY excluding rewards */
  monthlyBorrowApy?: Maybe<Scalars['Float']>;
  /** Monthly Borrow APY including rewards */
  monthlyNetBorrowApy?: Maybe<Scalars['Float']>;
  /** Monthly Supply APY including rewards */
  monthlyNetSupplyApy?: Maybe<Scalars['Float']>;
  /** Monthly Supply APY excluding rewards */
  monthlySupplyApy?: Maybe<Scalars['Float']>;
  /** Instantaneous Borrow APY including rewards */
  netBorrowApy?: Maybe<Scalars['Float']>;
  /** Instantaneous Supply APY including rewards */
  netSupplyApy?: Maybe<Scalars['Float']>;
  /** Collateral price */
  price?: Maybe<Scalars['BigInt']>;
  /** Quarterly Borrow APY excluding rewards */
  quarterlyBorrowApy?: Maybe<Scalars['Float']>;
  /** Quarterly Borrow APY including rewards */
  quarterlyNetBorrowApy?: Maybe<Scalars['Float']>;
  /** Quarterly Supply APY including rewards */
  quarterlyNetSupplyApy?: Maybe<Scalars['Float']>;
  /** Quarterly Supply APY excluding rewards */
  quarterlySupplyApy?: Maybe<Scalars['Float']>;
  /** Rate at target utilization */
  rateAtTarget?: Maybe<Scalars['BigInt']>;
  /**
   * Apy at target utilization
   * @deprecated Use `apyAtTarget` instead
   */
  rateAtUTarget: Scalars['Float'];
  /** Market state rewards */
  rewards?: Maybe<Array<MarketStateReward>>;
  /** Total size of the market. This is the sum of all assets that are allocated or can be reallocated to this market. */
  size: Scalars['BigInt'];
  /** Total size of the market. This is the sum of all assets that are allocated or can be reallocated to this market, in USD for display purpose. */
  sizeUsd?: Maybe<Scalars['Float']>;
  /** Instantaneous Supply APY */
  supplyApy: Scalars['Float'];
  /** Amount supplied on the market, in underlying units. Amount increases as interests accrue. */
  supplyAssets: Scalars['BigInt'];
  /** Amount supplied on the market, in USD for display purpose */
  supplyAssetsUsd?: Maybe<Scalars['Float']>;
  /** Amount supplied on the market, in market share units. Amount does not increase as interest accrue. */
  supplyShares: Scalars['BigInt'];
  /** Last update timestamp. */
  timestamp: Scalars['BigInt'];
  /** Amount available to borrow on the market, including shared liquidity. */
  totalLiquidity: Scalars['BigInt'];
  /** Amount available to borrow on the market, including shared liquidity, in USD for display purpose. */
  totalLiquidityUsd?: Maybe<Scalars['Float']>;
  /** Utilization rate */
  utilization: Scalars['Float'];
  /** Weekly Borrow APY excluding rewards */
  weeklyBorrowApy?: Maybe<Scalars['Float']>;
  /** Weekly Borrow APY including rewards */
  weeklyNetBorrowApy?: Maybe<Scalars['Float']>;
  /** Weekly Supply APY including rewards */
  weeklyNetSupplyApy?: Maybe<Scalars['Float']>;
  /** Weekly Supply APY excluding rewards */
  weeklySupplyApy?: Maybe<Scalars['Float']>;
  /** Yearly Borrow APY excluding rewards */
  yearlyBorrowApy?: Maybe<Scalars['Float']>;
  /** Yearly Borrow APY including rewards */
  yearlyNetBorrowApy?: Maybe<Scalars['Float']>;
  /** Yearly Supply APY including rewards */
  yearlyNetSupplyApy?: Maybe<Scalars['Float']>;
  /** Yearly Supply APY excluding rewards */
  yearlySupplyApy?: Maybe<Scalars['Float']>;
}

/** Morpho Blue market state rewards */
export interface MarketStateReward {
  __typename?: 'MarketStateReward';
  /** Amount of reward tokens per borrowed token (annualized). Scaled to reward asset decimals. */
  amountPerBorrowedToken: Scalars['BigInt'];
  /** Amount of reward tokens per supplied token (annualized). Scaled to reward asset decimals. */
  amountPerSuppliedToken: Scalars['BigInt'];
  asset: Asset;
  /** Borrow rewards APR. */
  borrowApr?: Maybe<Scalars['Float']>;
  /**
   * Borrow rewards APY.
   * @deprecated Use `borrowApr` instead. This field will be removed in the future.
   */
  borrowApy?: Maybe<Scalars['Float']>;
  /** Supply rewards APR. */
  supplyApr?: Maybe<Scalars['Float']>;
  /**
   * Supply rewards APY.
   * @deprecated Use `supplyApr` instead. This field will be removed in the future.
   */
  supplyApy?: Maybe<Scalars['Float']>;
  /** Amount of reward tokens per year on the borrow side. Scaled to reward asset decimals. */
  yearlyBorrowTokens: Scalars['BigInt'];
  /** Amount of reward tokens per year on the supply side. Scaled to reward asset decimals. */
  yearlySupplyTokens: Scalars['BigInt'];
}

/** Market transfer transaction data */
export interface MarketTransferTransactionData {
  __typename?: 'MarketTransferTransactionData';
  assets: Scalars['BigInt'];
  assetsUsd?: Maybe<Scalars['Float']>;
  market: Market;
  shares: Scalars['BigInt'];
}

/** Market warning */
export interface MarketWarning {
  __typename?: 'MarketWarning';
  level: WarningLevel;
  metadata?: Maybe<MarketWarningMetadata>;
  type: Scalars['String'];
}

export type MarketWarningMetadata = CustomMetadata | HardcodedPriceMetadata;

export type Metadata = AddressRiskMetadata | AragonAddressMetadata | SafeAddressMetadata;

/** Morpho Blue deployment */
export interface MorphoBlue {
  __typename?: 'MorphoBlue';
  address: Scalars['Address'];
  chain: Chain;
  creationBlockNumber: Scalars['Int'];
  /** State history */
  historicalState?: Maybe<MorphoBlueStateHistory>;
  id: Scalars['ID'];
  /** Current state */
  state?: Maybe<MorphoBlueState>;
}

/** Filtering options for morpho blue deployments. */
export interface MorphoBlueFilters {
  /** Filter by deployment address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by morpho blue id */
  id_in?: InputMaybe<Array<Scalars['String']>>;
}

export enum MorphoBlueOrderBy {
  Address = 'Address'
}

/** Morpho Blue global state */
export interface MorphoBlueState {
  __typename?: 'MorphoBlueState';
  id: Scalars['ID'];
  /** Number of markets in the protocol */
  marketCount: Scalars['Int'];
  /** Last update timestamp. */
  timestamp: Scalars['BigInt'];
  /** Amount borrowed in all markets, in USD for display purpose */
  totalBorrowUsd: Scalars['Float'];
  /** Amount of collateral in all markets, in USD for display purpose */
  totalCollateralUsd: Scalars['Float'];
  /** Amount deposited in all markets, in USD for display purpose */
  totalDepositUsd: Scalars['Float'];
  /** Amount supplied in all markets, in USD for display purpose */
  totalSupplyUsd: Scalars['Float'];
  /** TVL (collateral + supply - borrows), in USD for display purpose */
  tvlUsd: Scalars['Float'];
  /** Number of unique users that have interacted with the protocol */
  userCount: Scalars['Int'];
  /** Number of meta morpho vaults in the protocol */
  vaultCount: Scalars['Int'];
}

/** Morpho Blue state history */
export interface MorphoBlueStateHistory {
  __typename?: 'MorphoBlueStateHistory';
  /** Number of markets in the protocol */
  marketCount?: Maybe<Array<IntDataPoint>>;
  /** Amount borrowed in all markets, in USD for display purpose */
  totalBorrowUsd?: Maybe<Array<FloatDataPoint>>;
  /** Amount of collateral in all markets, in USD for display purpose. */
  totalCollateralUsd?: Maybe<Array<FloatDataPoint>>;
  /** Amount deposited in all markets, in USD for display purpose */
  totalDepositUsd?: Maybe<Array<FloatDataPoint>>;
  /** Amount supplied in all markets, in USD for display purpose */
  totalSupplyUsd?: Maybe<Array<FloatDataPoint>>;
  /** TVL (collateral + supply - borrows), in USD for display purpose */
  tvlUsd?: Maybe<Array<FloatDataPoint>>;
  /** Number of unique users that have interacted with the protocol */
  userCount?: Maybe<Array<IntDataPoint>>;
  /** Number of meta morpho vaults in the protocol */
  vaultCount?: Maybe<Array<IntDataPoint>>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryMarketCountArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryTotalBorrowUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryTotalCollateralUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryTotalDepositUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryTotalSupplyUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryTvlUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryUserCountArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Morpho Blue state history */
export interface MorphoBlueStateHistoryVaultCountArgs {
  options?: InputMaybe<TimeseriesOptions>;
}

/** Morpho chainlink oracle data */
export interface MorphoChainlinkOracleData {
  __typename?: 'MorphoChainlinkOracleData';
  baseFeedOne?: Maybe<OracleFeed>;
  baseFeedTwo?: Maybe<OracleFeed>;
  baseOracleVault?: Maybe<OracleVault>;
  chainId: Scalars['Int'];
  quoteFeedOne?: Maybe<OracleFeed>;
  quoteFeedTwo?: Maybe<OracleFeed>;
  scaleFactor: Scalars['BigInt'];
  /** @deprecated Use `baseOracleVault` instead */
  vault: Scalars['String'];
  vaultConversionSample: Scalars['BigInt'];
}

/** Morpho chainlink oracle v2 data */
export interface MorphoChainlinkOracleV2Data {
  __typename?: 'MorphoChainlinkOracleV2Data';
  baseFeedOne?: Maybe<OracleFeed>;
  baseFeedTwo?: Maybe<OracleFeed>;
  baseOracleVault?: Maybe<OracleVault>;
  /** @deprecated Use `baseOracleVault` instead */
  baseVault: Scalars['String'];
  baseVaultConversionSample: Scalars['BigInt'];
  chainId: Scalars['Int'];
  quoteFeedOne?: Maybe<OracleFeed>;
  quoteFeedTwo?: Maybe<OracleFeed>;
  quoteOracleVault?: Maybe<OracleVault>;
  /** @deprecated Use `quoteOracleVault` instead */
  quoteVault: Scalars['String'];
  quoteVaultConversionSample: Scalars['BigInt'];
  scaleFactor: Scalars['BigInt'];
}

/** Oracle */
export interface Oracle {
  __typename?: 'Oracle';
  /** Oracle contract address */
  address: Scalars['Address'];
  chain: Chain;
  creationEvent?: Maybe<ChainlinkOracleV2Event>;
  data?: Maybe<OracleData>;
  id: Scalars['ID'];
  markets: Array<Market>;
  /** Oracle type */
  type: OracleType;
}

export type OracleData = MorphoChainlinkOracleData | MorphoChainlinkOracleV2Data;

/** Oracle Feed */
export interface OracleFeed {
  __typename?: 'OracleFeed';
  /** Feed contract address */
  address: Scalars['Address'];
  chain: Chain;
  decimals?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  historicalPrice?: Maybe<Array<BigIntDataPoint>>;
  id: Scalars['ID'];
  pair?: Maybe<Array<Scalars['String']>>;
  price?: Maybe<BigIntDataPoint>;
  vendor?: Maybe<Scalars['String']>;
}


/** Oracle Feed */
export interface OracleFeedHistoricalPriceArgs {
  options?: TimeseriesOptions;
}

export interface OracleFeedsFilters {
  /** Filter by feed contract address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
}

export enum OracleType {
  ChainlinkOracle = 'ChainlinkOracle',
  ChainlinkOracleV2 = 'ChainlinkOracleV2',
  CustomOracle = 'CustomOracle',
  Unknown = 'Unknown'
}

/** Oracle Vault */
export interface OracleVault {
  __typename?: 'OracleVault';
  /** Vault contract address */
  address: Scalars['Address'];
  assetId?: Maybe<Scalars['String']>;
  chain: Chain;
  decimals?: Maybe<Scalars['Int']>;
  historicalPrice?: Maybe<Array<BigIntDataPoint>>;
  id: Scalars['ID'];
  metamorphoId?: Maybe<Scalars['String']>;
  pair?: Maybe<Array<Scalars['String']>>;
  price?: Maybe<BigIntDataPoint>;
  vendor?: Maybe<Scalars['String']>;
}


/** Oracle Vault */
export interface OracleVaultHistoricalPriceArgs {
  options?: TimeseriesOptions;
}

export interface OracleVaultsFilters {
  /** Filter by vault contract address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
}

export interface OraclesFilters {
  /** Filter by oracle contract address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
}

export enum OrderDirection {
  Asc = 'Asc',
  Desc = 'Desc'
}

/** Event data for ownership-related operations */
export interface OwnershipEventData {
  __typename?: 'OwnershipEventData';
  owner: Scalars['Address'];
}

export interface PageInfo {
  __typename?: 'PageInfo';
  /** Number of items as scoped by pagination. */
  count: Scalars['Int'];
  /** Total number of items */
  countTotal: Scalars['Int'];
  /** Number of items requested. */
  limit: Scalars['Int'];
  /** Number of items skipped. */
  skip: Scalars['Int'];
}

export interface PaginatedAddressMetadata {
  __typename?: 'PaginatedAddressMetadata';
  items?: Maybe<Array<AddressMetadata>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedAssets {
  __typename?: 'PaginatedAssets';
  items?: Maybe<Array<Asset>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedCurators {
  __typename?: 'PaginatedCurators';
  items?: Maybe<Array<Curator>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedMarketPositions {
  __typename?: 'PaginatedMarketPositions';
  items?: Maybe<Array<MarketPosition>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedMarkets {
  __typename?: 'PaginatedMarkets';
  items?: Maybe<Array<Market>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedMetaMorphoFactories {
  __typename?: 'PaginatedMetaMorphoFactories';
  items?: Maybe<Array<VaultFactory>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedMetaMorphoPositions {
  __typename?: 'PaginatedMetaMorphoPositions';
  items?: Maybe<Array<VaultPosition>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedMetaMorphos {
  __typename?: 'PaginatedMetaMorphos';
  items?: Maybe<Array<Vault>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedMorphoBlue {
  __typename?: 'PaginatedMorphoBlue';
  items?: Maybe<Array<MorphoBlue>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedOracleFeeds {
  __typename?: 'PaginatedOracleFeeds';
  items?: Maybe<Array<OracleFeed>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedOracleVaults {
  __typename?: 'PaginatedOracleVaults';
  items?: Maybe<Array<OracleVault>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedOracles {
  __typename?: 'PaginatedOracles';
  items?: Maybe<Array<Oracle>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedPublicAllocator {
  __typename?: 'PaginatedPublicAllocator';
  items?: Maybe<Array<PublicAllocator>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedPublicAllocatorReallocates {
  __typename?: 'PaginatedPublicAllocatorReallocates';
  items?: Maybe<Array<PublicAllocatorReallocate>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedTransactions {
  __typename?: 'PaginatedTransactions';
  items?: Maybe<Array<Transaction>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedUsers {
  __typename?: 'PaginatedUsers';
  items?: Maybe<Array<User>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedVaultAdminEvent {
  __typename?: 'PaginatedVaultAdminEvent';
  items?: Maybe<Array<VaultAdminEvent>>;
  pageInfo?: Maybe<PageInfo>;
}

export interface PaginatedVaultReallocates {
  __typename?: 'PaginatedVaultReallocates';
  items?: Maybe<Array<VaultReallocate>>;
  pageInfo?: Maybe<PageInfo>;
}

/** Public allocator */
export interface PublicAllocator {
  __typename?: 'PublicAllocator';
  address: Scalars['Address'];
  creationBlockNumber: Scalars['Int'];
  id: Scalars['ID'];
  morphoBlue: MorphoBlue;
}

/** Public allocator configuration */
export interface PublicAllocatorConfig {
  __typename?: 'PublicAllocatorConfig';
  accruedFee: Scalars['BigInt'];
  admin: Scalars['Address'];
  fee: Scalars['BigInt'];
  flowCaps: Array<PublicAllocatorFlowCaps>;
}

/** Filtering options for public allocators. */
export interface PublicAllocatorFilters {
  /** Filter by address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by ids */
  id_in?: InputMaybe<Array<Scalars['String']>>;
}

/** Public allocator flow caps */
export interface PublicAllocatorFlowCaps {
  __typename?: 'PublicAllocatorFlowCaps';
  market: Market;
  /** Public allocator flow cap in USD */
  maxIn: Scalars['BigInt'];
  /** Public allocator flow cap in underlying */
  maxOut: Scalars['BigInt'];
}

export enum PublicAllocatorOrderBy {
  Address = 'Address'
}

/** Public alllocator reallocate */
export interface PublicAllocatorReallocate {
  __typename?: 'PublicAllocatorReallocate';
  assets: Scalars['BigInt'];
  blockNumber: Scalars['BigInt'];
  hash: Scalars['HexString'];
  id: Scalars['ID'];
  logIndex: Scalars['Int'];
  market: Market;
  publicAllocator: PublicAllocator;
  sender: Scalars['Address'];
  timestamp: Scalars['BigInt'];
  type: PublicAllocatorReallocateType;
  vault: Vault;
}

export enum PublicAllocatorReallocateOrderBy {
  Assets = 'Assets',
  Timestamp = 'Timestamp'
}

export enum PublicAllocatorReallocateType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw'
}

/** Public alllocator shared liquidity */
export interface PublicAllocatorSharedLiquidity {
  __typename?: 'PublicAllocatorSharedLiquidity';
  allocationMarket: Market;
  assets: Scalars['BigInt'];
  id: Scalars['ID'];
  market: Market;
  publicAllocator: PublicAllocator;
  vault: Vault;
}

/** Filtering options for public allocator reallocates. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface PublicallocatorReallocateFilters {
  /** Filter by greater than or equal to given amount of market assets, in underlying token units */
  assets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of market assets, in underlying token units */
  assets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given timestamp */
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  /** Filter by lower than or equal to given timestamp */
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  /** Filter by reallocate type */
  type_in?: InputMaybe<Array<PublicAllocatorReallocateType>>;
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars['String']>>;
}

export interface Query {
  __typename?: 'Query';
  asset: Asset;
  assetByAddress: Asset;
  assets: PaginatedAssets;
  chain: Chain;
  chainSynchronizationState: ChainSynchronizationState;
  chainSynchronizationStates: Array<ChainSynchronizationState>;
  chains: Array<Chain>;
  curator: Curator;
  curators: PaginatedCurators;
  market: Market;
  marketAverageApys?: Maybe<MarketApyAggregates>;
  marketByUniqueKey: Market;
  marketCollateralAtRisk: MarketCollateralAtRisk;
  marketOracleAccuracy: MarketOracleAccuracy;
  marketPosition: MarketPosition;
  marketPositions: PaginatedMarketPositions;
  markets: PaginatedMarkets;
  morphoBlue: MorphoBlue;
  morphoBlueByAddress: MorphoBlue;
  morphoBlues: PaginatedMorphoBlue;
  oracleByAddress: Oracle;
  oracleFeedByAddress: OracleFeed;
  oracleFeeds: PaginatedOracleFeeds;
  oracleVaultByAddress: OracleVault;
  oracleVaults: PaginatedOracleVaults;
  oracles: PaginatedOracles;
  publicAllocator: PublicAllocator;
  publicAllocatorReallocates: PaginatedPublicAllocatorReallocates;
  publicAllocators: PaginatedPublicAllocator;
  search: SearchResults;
  transaction: Transaction;
  /** @deprecated Multiple Transaction entities correspond to a single hash, because a Transaction entity corresponds to an onchain event. */
  transactionByHash: Transaction;
  transactions: PaginatedTransactions;
  user: User;
  userByAddress: User;
  users: PaginatedUsers;
  vault: Vault;
  vaultByAddress: Vault;
  vaultFactories: PaginatedMetaMorphoFactories;
  vaultFactory: VaultFactory;
  vaultFactoryByAddress: VaultFactory;
  vaultPosition: VaultPosition;
  vaultPositions: PaginatedMetaMorphoPositions;
  vaultReallocates: PaginatedVaultReallocates;
  vaults: PaginatedMetaMorphos;
}


export interface QueryAssetArgs {
  id: Scalars['String'];
}


export interface QueryAssetByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryAssetsArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AssetsFilters>;
}


export interface QueryChainArgs {
  id: Scalars['Int'];
}


export interface QueryChainSynchronizationStateArgs {
  chainId?: Scalars['Int'];
  key: Scalars['String'];
}


export interface QueryCuratorArgs {
  id: Scalars['String'];
}


export interface QueryCuratorsArgs {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CuratorFilters>;
}


export interface QueryMarketArgs {
  id: Scalars['String'];
}


export interface QueryMarketAverageApysArgs {
  chainId?: InputMaybe<Scalars['Int']>;
  startTimestamp: Scalars['Float'];
  uniqueKey: Scalars['String'];
}


export interface QueryMarketByUniqueKeyArgs {
  chainId?: InputMaybe<Scalars['Int']>;
  uniqueKey: Scalars['String'];
}


export interface QueryMarketCollateralAtRiskArgs {
  chainId?: InputMaybe<Scalars['Int']>;
  numberOfPoints?: InputMaybe<Scalars['Float']>;
  uniqueKey: Scalars['String'];
}


export interface QueryMarketOracleAccuracyArgs {
  marketId: Scalars['String'];
  options?: InputMaybe<TimeseriesOptions>;
}


export interface QueryMarketPositionArgs {
  chainId?: InputMaybe<Scalars['Int']>;
  marketUniqueKey: Scalars['String'];
  userAddress: Scalars['String'];
}


export interface QueryMarketPositionsArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MarketPositionOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<MarketPositionFilters>;
}


export interface QueryMarketsArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MarketOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<MarketFilters>;
}


export interface QueryMorphoBlueArgs {
  id: Scalars['String'];
}


export interface QueryMorphoBlueByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryMorphoBluesArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MorphoBlueOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<MorphoBlueFilters>;
}


export interface QueryOracleByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryOracleFeedByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryOracleFeedsArgs {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<OracleFeedsFilters>;
}


export interface QueryOracleVaultByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryOracleVaultsArgs {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<OracleVaultsFilters>;
}


export interface QueryOraclesArgs {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<OraclesFilters>;
}


export interface QueryPublicAllocatorArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryPublicAllocatorReallocatesArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PublicAllocatorReallocateOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PublicallocatorReallocateFilters>;
}


export interface QueryPublicAllocatorsArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PublicAllocatorOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PublicAllocatorFilters>;
}


export interface QuerySearchArgs {
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  marketOrderBy?: InputMaybe<MarketOrderBy>;
  numberOfResults?: InputMaybe<Scalars['Int']>;
  search: Scalars['String'];
  vaultOrderBy?: InputMaybe<VaultOrderBy>;
}


export interface QueryTransactionArgs {
  id: Scalars['String'];
}


export interface QueryTransactionByHashArgs {
  chainId?: InputMaybe<Scalars['Int']>;
  hash: Scalars['String'];
}


export interface QueryTransactionsArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransactionsOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TransactionFilters>;
}


export interface QueryUserArgs {
  id: Scalars['String'];
}


export interface QueryUserByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryUsersArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UsersOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<UsersFilters>;
}


export interface QueryVaultArgs {
  id: Scalars['String'];
}


export interface QueryVaultByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryVaultFactoryArgs {
  id: Scalars['String'];
}


export interface QueryVaultFactoryByAddressArgs {
  address: Scalars['String'];
  chainId?: InputMaybe<Scalars['Int']>;
}


export interface QueryVaultPositionArgs {
  chainId?: InputMaybe<Scalars['Int']>;
  userAddress: Scalars['String'];
  vaultAddress: Scalars['String'];
}


export interface QueryVaultPositionsArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VaultPositionOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<VaultPositionFilters>;
}


export interface QueryVaultReallocatesArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VaultReallocateOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<VaultReallocateFilters>;
}


export interface QueryVaultsArgs {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VaultOrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<VaultFilters>;
}

/** ReallocateSupply event data */
export interface ReallocateSupplyEventData {
  __typename?: 'ReallocateSupplyEventData';
  market: Market;
  suppliedAssets: Scalars['BigInt'];
  suppliedShares: Scalars['BigInt'];
}

/** ReallocateWithdraw event data */
export interface ReallocateWithdrawEventData {
  __typename?: 'ReallocateWithdrawEventData';
  market: Market;
  withdrawnAssets: Scalars['BigInt'];
  withdrawnShares: Scalars['BigInt'];
}

/** Event data for revokeCap operation */
export interface RevokeCapEventData {
  __typename?: 'RevokeCapEventData';
  market: Market;
}

/** Event data for revokePendingMarketRemoval operation */
export interface RevokePendingMarketRemovalEventData {
  __typename?: 'RevokePendingMarketRemovalEventData';
  market: Market;
}

/** Risk analysis */
export interface RiskAnalysis {
  __typename?: 'RiskAnalysis';
  analysis: RiskAnalysisData;
  /** @deprecated Use `analysis.isUnderReview` instead */
  isUnderReview: Scalars['Boolean'];
  provider: RiskProvider;
  /** @deprecated Use `analysis.rating` instead */
  rating?: Maybe<Scalars['String']>;
  /** @deprecated Use `analysis.score` instead */
  score: Scalars['Float'];
  /** @deprecated Use `analysis.timestamp` instead */
  timestamp: Scalars['Float'];
}

export type RiskAnalysisData = CredoraRiskAnalysis;

export enum RiskProvider {
  Blockaid = 'BLOCKAID',
  Credora = 'CREDORA'
}

/** Safe address metadata */
export interface SafeAddressMetadata {
  __typename?: 'SafeAddressMetadata';
  owners: Array<Scalars['String']>;
  threshold: Scalars['Int'];
}

/** Global search results */
export interface SearchResults {
  __typename?: 'SearchResults';
  markets: Array<Market>;
  vaults: Array<Vault>;
}

/** SetCurator event data */
export interface SetCuratorEventData {
  __typename?: 'SetCuratorEventData';
  curatorAddress: Scalars['Address'];
}

/** SetFee event data */
export interface SetFeeEventData {
  __typename?: 'SetFeeEventData';
  fee: Scalars['BigInt'];
}

/** SetFeeRecipient event data */
export interface SetFeeRecipientEventData {
  __typename?: 'SetFeeRecipientEventData';
  feeRecipient: Scalars['Address'];
}

/** SetGuardian event data */
export interface SetGuardianEventData {
  __typename?: 'SetGuardianEventData';
  guardian: Scalars['Address'];
}

/** SetIsAllocator event data */
export interface SetIsAllocatorEventData {
  __typename?: 'SetIsAllocatorEventData';
  allocator: Scalars['Address'];
  isAllocator: Scalars['Boolean'];
}

/** SetSkimRecipient event data */
export interface SetSkimRecipientEventData {
  __typename?: 'SetSkimRecipientEventData';
  skimRecipient: Scalars['Address'];
}

/** SetSupplyQueue event data */
export interface SetSupplyQueueEventData {
  __typename?: 'SetSupplyQueueEventData';
  supplyQueue: Array<Market>;
}

/** SetWithdrawQueue event data */
export interface SetWithdrawQueueEventData {
  __typename?: 'SetWithdrawQueueEventData';
  withdrawQueue: Array<Market>;
}

/** Skim event data */
export interface SkimEventData {
  __typename?: 'SkimEventData';
  amount: Scalars['BigInt'];
  asset: Asset;
}

/** Event data for timelock-related operation */
export interface TimelockEventData {
  __typename?: 'TimelockEventData';
  timelock: Scalars['BigInt'];
}

export enum TimeseriesInterval {
  /** @deprecated Use startTimestamp and endTimestamp instead. */
  All = 'ALL',
  Day = 'DAY',
  /** @deprecated HOUR is the minimum interval. */
  FifteenMinutes = 'FIFTEEN_MINUTES',
  /** @deprecated HOUR is the minimum interval. */
  FiveMinutes = 'FIVE_MINUTES',
  /** @deprecated HOUR is the minimum interval. */
  HalfHour = 'HALF_HOUR',
  Hour = 'HOUR',
  /** @deprecated HOUR is the minimum interval. */
  Minute = 'MINUTE',
  Month = 'MONTH',
  Quarter = 'QUARTER',
  Week = 'WEEK',
  Year = 'YEAR'
}

export interface TimeseriesOptions {
  /** Unix timestamp (Inclusive). */
  endTimestamp?: InputMaybe<Scalars['Int']>;
  /** The timestamp interval to space and group points. Defaults to around 50 points between startTimestamp and endTimestamp. */
  interval?: InputMaybe<TimeseriesInterval>;
  /** Unix timestamp (Inclusive). */
  startTimestamp?: InputMaybe<Scalars['Int']>;
}

/** Transaction */
export interface Transaction {
  __typename?: 'Transaction';
  blockNumber: Scalars['BigInt'];
  chain: Chain;
  data: TransactionData;
  hash: Scalars['HexString'];
  id: Scalars['ID'];
  logIndex: Scalars['Int'];
  timestamp: Scalars['BigInt'];
  type: TransactionType;
  user: User;
}

export type TransactionData = MarketCollateralTransferTransactionData | MarketLiquidationTransactionData | MarketTransferTransactionData | VaultTransactionData;

/** Filtering options for transactions. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface TransactionFilters {
  /** Filter by token contract address. Case insensitive. */
  assetAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by asset id */
  assetId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by token symbol. */
  assetSymbol_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given amount of market assets, in USD */
  assetsUsd_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given amount of market assets, in USD */
  assetsUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given amount of market assets, in underlying token units */
  assets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of market assets, in underlying token units */
  assets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given amount of bad debt assets, in USD. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssetsUsd_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given amount of bad debt assets, in USD. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssetsUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given amount of bad debt assets. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of bad debt assets. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given amount of bad debt shares. Applies exclusively to MarketLiquidation transactions. */
  badDebtShares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of bad debt shares. Applies exclusively to MarketLiquidation transactions. */
  badDebtShares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by transaction hash */
  hash?: InputMaybe<Scalars['String']>;
  /** Filter by liquidator address. Applies exclusively to MarketLiquidation transactions. */
  liquidator_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given amount of repaid shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  repaidAssetsUsd_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given amount of repaid shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  repaidAssetsUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidAssets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidAssets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidShares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidShares_lte?: InputMaybe<Scalars['BigInt']>;
  search?: InputMaybe<Scalars['String']>;
  /** Filter by greater than or equal to given amount of seized shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  seizedAssetsUsd_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given amount of seized shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  seizedAssetsUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given amount of seized shares. Applies exclusively to MarketLiquidation transactions. */
  seizedAssets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of seized shares. Applies exclusively to MarketLiquidation transactions. */
  seizedAssets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given amount of MetaMorpho vault shares */
  shares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of MetaMorpho vault shares */
  shares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given timestamp */
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  /** Filter by lower than or equal to given timestamp */
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  /** Filter by transaction type */
  type_in?: InputMaybe<Array<TransactionType>>;
  /** Filter by user address. Case insensitive. */
  userAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by user id */
  userId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars['String']>>;
}

export enum TransactionType {
  MarketBorrow = 'MarketBorrow',
  MarketLiquidation = 'MarketLiquidation',
  MarketRepay = 'MarketRepay',
  MarketSupply = 'MarketSupply',
  MarketSupplyCollateral = 'MarketSupplyCollateral',
  MarketWithdraw = 'MarketWithdraw',
  MarketWithdrawCollateral = 'MarketWithdrawCollateral',
  MetaMorphoDeposit = 'MetaMorphoDeposit',
  MetaMorphoFee = 'MetaMorphoFee',
  MetaMorphoTransfer = 'MetaMorphoTransfer',
  MetaMorphoWithdraw = 'MetaMorphoWithdraw'
}

export enum TransactionsOrderBy {
  Assets = 'Assets',
  AssetsUsd = 'AssetsUsd',
  BadDebtAssets = 'BadDebtAssets',
  BadDebtAssetsUsd = 'BadDebtAssetsUsd',
  BadDebtShares = 'BadDebtShares',
  RepaidAssets = 'RepaidAssets',
  RepaidAssetsUsd = 'RepaidAssetsUsd',
  RepaidShares = 'RepaidShares',
  SeizedAssets = 'SeizedAssets',
  SeizedAssetsUsd = 'SeizedAssetsUsd',
  Shares = 'Shares',
  Timestamp = 'Timestamp'
}

/** User */
export interface User {
  __typename?: 'User';
  address: Scalars['Address'];
  chain: Chain;
  historicalState: UserHistory;
  id: Scalars['ID'];
  marketPositions: Array<MarketPosition>;
  state: UserState;
  tag?: Maybe<Scalars['String']>;
  transactions: Array<Transaction>;
  vaultPositions: Array<VaultPosition>;
}

/** User state history */
export interface UserHistory {
  __typename?: 'UserHistory';
  /** Total borrow assets of all the user's market positions, in USD. */
  marketsBorrowAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Total collateral of all the user's market positions, in USD. */
  marketsCollateralUsd?: Maybe<Array<FloatDataPoint>>;
  /** Total margin of all the user's market positions, in USD. */
  marketsMarginUsd?: Maybe<Array<FloatDataPoint>>;
  /** Total supply assets of all the user's market positions, in USD. */
  marketsSupplyAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Total value of all the user's vault positions, in USD. */
  vaultsAssetsUsd?: Maybe<Array<FloatDataPoint>>;
}


/** User state history */
export interface UserHistoryMarketsBorrowAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** User state history */
export interface UserHistoryMarketsCollateralUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** User state history */
export interface UserHistoryMarketsMarginUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** User state history */
export interface UserHistoryMarketsSupplyAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** User state history */
export interface UserHistoryVaultsAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}

/** User state */
export interface UserState {
  __typename?: 'UserState';
  /** Total borrow assets of all the user's market positions, in USD. */
  marketsBorrowAssetsUsd?: Maybe<Scalars['Float']>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the borrow side of the position since its inception, in USD for display purpose. */
  marketsBorrowPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the borrow side of all the user's market positions, taking into account prices variation. */
  marketsBorrowRoeUsd?: Maybe<Scalars['Float']>;
  /** Profit & Loss (from the collateral asset's price variation) of the collateral of the position since its inception, in USD for display purpose. */
  marketsCollateralPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the collateral of all the user's market positions, taking into account prices variation. */
  marketsCollateralRoeUsd?: Maybe<Scalars['Float']>;
  /** Total collateral of all the user's market positions, in USD. */
  marketsCollateralUsd?: Maybe<Scalars['Float']>;
  /** Profit & Loss (from the collateral asset's price variation and loan interest) of the margin of the position since its inception, in USD for display purpose. */
  marketsMarginPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the margin of all the user's market positions, taking into account prices variation. */
  marketsMarginRoeUsd?: Maybe<Scalars['Float']>;
  /** Total margin of all the user's market positions, in USD. */
  marketsMarginUsd?: Maybe<Scalars['Float']>;
  /** Profit (from the underlying asset's price variation) & Loss (from bad debt socialization) of all the user's market positions, in USD. */
  marketsPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of all the user's market positions, taking into account prices variation. */
  marketsRoeUsd?: Maybe<Scalars['Float']>;
  /** Total supply assets of all the user's market positions, in USD. */
  marketsSupplyAssetsUsd?: Maybe<Scalars['Float']>;
  /** Profit & Loss (from the loan asset's price variation and interest) of the supply side of the position since its inception, in USD for display purpose. */
  marketsSupplyPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the supply side of all the user's market positions, taking into account prices variation. */
  marketsSupplyRoeUsd?: Maybe<Scalars['Float']>;
  /** Total value of all the user's vault positions, in USD. */
  vaultsAssetsUsd?: Maybe<Scalars['Float']>;
  /** Profit (from the underlying asset's price variation) & Loss (from bad debt socialization) of all the user's vault positions, in USD. */
  vaultsPnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of all the user's vault positions, taking into account prices variation. */
  vaultsRoeUsd?: Maybe<Scalars['Float']>;
}

/** Filtering options for users. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface UsersFilters {
  /** Filter by user address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by token contract address. Case insensitive. */
  assetAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by asset id */
  assetId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by token symbol */
  assetSymbol_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by user id */
  id_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars['String']>>;
  search?: InputMaybe<Scalars['String']>;
  /** Filter by MetaMorpho vault address. Case insensitive. */
  vaultAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho vault id. */
  vaultId_in?: InputMaybe<Array<Scalars['String']>>;
}

export enum UsersOrderBy {
  Address = 'Address'
}

/** MetaMorpho Vaults */
export interface Vault {
  __typename?: 'Vault';
  address: Scalars['Address'];
  /** Vault admin events on the vault */
  adminEvents?: Maybe<PaginatedVaultAdminEvent>;
  /** Vault allocators */
  allocators?: Maybe<Array<VaultAllocator>>;
  asset: Asset;
  chain: Chain;
  creationBlockNumber: Scalars['Int'];
  creationTimestamp: Scalars['BigInt'];
  creatorAddress?: Maybe<Scalars['Address']>;
  /**
   * Daily vault APY
   * @deprecated Use dailyApys instead.
   */
  dailyApy?: Maybe<Scalars['Float']>;
  /** Daily vault APYs */
  dailyApys?: Maybe<VaultApyAggregates>;
  factory: VaultFactory;
  historicalState: VaultHistory;
  id: Scalars['ID'];
  /** Vault liquidity */
  liquidity?: Maybe<VaultLiquidity>;
  metadata?: Maybe<VaultMetadata>;
  /**
   * Monthly vault APY
   * @deprecated Use monthlyApys instead.
   */
  monthlyApy?: Maybe<Scalars['Float']>;
  /** Monthly vault APYs */
  monthlyApys?: Maybe<VaultApyAggregates>;
  name: Scalars['String'];
  /** Vault pending caps */
  pendingCaps?: Maybe<Array<VaultPendingCap>>;
  /** Public allocator configuration */
  publicAllocatorConfig?: Maybe<PublicAllocatorConfig>;
  /** Risk related data on the vault */
  riskAnalysis?: Maybe<Array<RiskAnalysis>>;
  state?: Maybe<VaultState>;
  symbol: Scalars['String'];
  /** Vault warnings */
  warnings?: Maybe<Array<VaultWarning>>;
  /**
   * Weekly vault APY
   * @deprecated Use weeklyApys instead.
   */
  weeklyApy?: Maybe<Scalars['Float']>;
  /** Weekly vault APYs */
  weeklyApys?: Maybe<VaultApyAggregates>;
  whitelisted: Scalars['Boolean'];
}


/** MetaMorpho Vaults */
export interface VaultAdminEventsArgs {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<VaultAdminEventsFilters>;
}

/** Meta Morpho vault event data */
export interface VaultAdminEvent {
  __typename?: 'VaultAdminEvent';
  data?: Maybe<VaultAdminEventData>;
  hash: Scalars['HexString'];
  timestamp: Scalars['BigInt'];
  type: Scalars['String'];
}

export type VaultAdminEventData = CapEventData | OwnershipEventData | ReallocateSupplyEventData | ReallocateWithdrawEventData | RevokeCapEventData | RevokePendingMarketRemovalEventData | SetCuratorEventData | SetFeeEventData | SetFeeRecipientEventData | SetGuardianEventData | SetIsAllocatorEventData | SetSkimRecipientEventData | SetSupplyQueueEventData | SetWithdrawQueueEventData | SkimEventData | TimelockEventData;

/** Filtering options for vault admin events. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface VaultAdminEventsFilters {
  /** Filter by event type */
  type_in?: InputMaybe<Array<Scalars['String']>>;
}

/** MetaMorpho vault allocation */
export interface VaultAllocation {
  __typename?: 'VaultAllocation';
  /** Block number in which the allocation was computed */
  blockNumber?: Maybe<Scalars['BigInt']>;
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  market: Market;
  /** Pending maximum amount of asset that can be supplied on market by the vault, in market underlying token units */
  pendingSupplyCap?: Maybe<Scalars['BigInt']>;
  /** Pending maximum amount of asset that can be supplied on market by the vault, in USD for display purpose. */
  pendingSupplyCapUsd?: Maybe<Scalars['Float']>;
  /** Pending supply cap apply timestamp */
  pendingSupplyCapValidAt?: Maybe<Scalars['BigInt']>;
  removableAt: Scalars['BigInt'];
  /** Amount of asset supplied on market, in market underlying token units */
  supplyAssets: Scalars['BigInt'];
  /** Amount of asset supplied on market, in USD for display purpose. */
  supplyAssetsUsd?: Maybe<Scalars['Float']>;
  /** Maximum amount of asset that can be supplied on market by the vault, in market underlying token units */
  supplyCap: Scalars['BigInt'];
  /** Maximum amount of asset that can be supplied on market by the vault, in USD for display purpose. */
  supplyCapUsd?: Maybe<Scalars['Float']>;
  /** Supply queue index */
  supplyQueueIndex?: Maybe<Scalars['Int']>;
  /** Amount of supplied shares on market. */
  supplyShares: Scalars['BigInt'];
  /** Withdraw queue index */
  withdrawQueueIndex?: Maybe<Scalars['Int']>;
}

/** MetaMorpho vault allocation history */
export interface VaultAllocationHistory {
  __typename?: 'VaultAllocationHistory';
  market: Market;
  /** Amount of asset supplied on market, in market underlying token units */
  supplyAssets: Array<BigIntDataPoint>;
  /** Amount of asset supplied on market, in USD for display purpose. */
  supplyAssetsUsd: Array<FloatDataPoint>;
  /** Maximum amount of asset that can be supplied on market by the vault, in market underlying token units */
  supplyCap: Array<BigIntDataPoint>;
  /** Maximum amount of asset that can be supplied on market by the vault, in USD for display purpose. */
  supplyCapUsd: Array<FloatDataPoint>;
}


/** MetaMorpho vault allocation history */
export interface VaultAllocationHistorySupplyAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** MetaMorpho vault allocation history */
export interface VaultAllocationHistorySupplyAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** MetaMorpho vault allocation history */
export interface VaultAllocationHistorySupplyCapArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** MetaMorpho vault allocation history */
export interface VaultAllocationHistorySupplyCapUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}

/** Vault allocator */
export interface VaultAllocator {
  __typename?: 'VaultAllocator';
  /** Allocator adress. */
  address: Scalars['Address'];
  /** Allocator since block number */
  blockNumber: Scalars['BigInt'];
  /** Additional information about the address. */
  metadata?: Maybe<PaginatedAddressMetadata>;
  /** Allocator since timestamp */
  timestamp: Scalars['BigInt'];
}

/** Vault APY aggregates */
export interface VaultApyAggregates {
  __typename?: 'VaultApyAggregates';
  /** Average vault apy excluding rewards, before deducting the performance fee. */
  apy?: Maybe<Scalars['Float']>;
  /** Average vault APY including rewards, after deducting the performance fee. */
  netApy?: Maybe<Scalars['Float']>;
}

/** MetaMorpho Vault Factories */
export interface VaultFactory {
  __typename?: 'VaultFactory';
  address: Scalars['Address'];
  chain: Chain;
  creationBlockNumber: Scalars['Int'];
  id: Scalars['ID'];
}

export interface VaultFilters {
  /** Filter by MetaMorpho vault address */
  address_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter out by MetaMorpho vault address */
  address_not_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given APY. */
  apy_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given APY. */
  apy_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by asset contract address */
  assetAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by asset id */
  assetId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by asset symbol */
  assetSymbol_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by asset tags. */
  assetTags_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  countryCode?: InputMaybe<Scalars['String']>;
  /** Filter by MetaMorpho creator address */
  creatorAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by credora risk score greater than or equal to given value */
  credoraRiskScore_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by credora risk score lower than or equal to given value */
  credoraRiskScore_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by MetaMorpho current curator address */
  curatorAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho curators ids */
  curator_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorphoFactory address */
  factoryAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given fee rate. */
  fee_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given fee rate. */
  fee_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by MetaMorpho vault id */
  id_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by markets in which the vault has positions. */
  marketUniqueKey_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given net APY. */
  netApy_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given net APY. */
  netApy_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by MetaMorpho owner address */
  ownerAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by lower than or equal to given public allocator fee in dollar. */
  publicAllocatorFeeUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given public allocator fee in ETH (wad) */
  publicAllocatorFee_lte?: InputMaybe<Scalars['Float']>;
  search?: InputMaybe<Scalars['String']>;
  /** Filter by MetaMorpho vault symbol */
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given amount of total assets, in USD. */
  totalAssetsUsd_gte?: InputMaybe<Scalars['Float']>;
  /** Filter by lower than or equal to given amount of total assets, in USD. */
  totalAssetsUsd_lte?: InputMaybe<Scalars['Float']>;
  /** Filter by greater than or equal to given amount of total assets, in underlying token units. */
  totalAssets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of total assets, in underlying token units. */
  totalAssets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given amount of shares total supply. */
  totalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of shares total supply. */
  totalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  whitelisted?: InputMaybe<Scalars['Boolean']>;
}

/** Meta-Morpho vault history */
export interface VaultHistory {
  __typename?: 'VaultHistory';
  /** All Time Vault APY excluding rewards, before deducting the performance fee. */
  allTimeApy?: Maybe<Array<FloatDataPoint>>;
  /** All Time Vault APY including rewards, after deducting the performance fee. */
  allTimeNetApy?: Maybe<Array<FloatDataPoint>>;
  /** Vault allocation on Morpho Blue markets. */
  allocation?: Maybe<Array<VaultAllocationHistory>>;
  /** Vault APY excluding rewards, before deducting the performance fee. */
  apy?: Maybe<Array<FloatDataPoint>>;
  /** Vault curator. */
  curator?: Maybe<Array<AddressDataPoint>>;
  /** Daily Vault APY excluding rewards, before deducting the performance fee. */
  dailyApy?: Maybe<Array<FloatDataPoint>>;
  /** Daily Vault APY including rewards, after deducting the performance fee. */
  dailyNetApy?: Maybe<Array<FloatDataPoint>>;
  /** Vault performance fee. */
  fee?: Maybe<Array<FloatDataPoint>>;
  /** Fee recipient. */
  feeRecipient?: Maybe<Array<AddressDataPoint>>;
  /** Guardian. */
  guardian?: Maybe<Array<AddressDataPoint>>;
  /** Monthly Vault APY excluding rewards, before deducting the performance fee. */
  monthlyApy?: Maybe<Array<FloatDataPoint>>;
  /** Monthly Vault APY including rewards, after deducting the performance fee. */
  monthlyNetApy?: Maybe<Array<FloatDataPoint>>;
  /** Vault APY including rewards, after deducting the performance fee. */
  netApy?: Maybe<Array<FloatDataPoint>>;
  /** Vault APY excluding rewards, after deducting the performance fee. */
  netApyWithoutRewards?: Maybe<Array<FloatDataPoint>>;
  /** Owner. */
  owner?: Maybe<Array<AddressDataPoint>>;
  /** Quarterly Vault APY excluding rewards, before deducting the performance fee. */
  quarterlyApy?: Maybe<Array<FloatDataPoint>>;
  /** Quarterly Vault APY including rewards, after deducting the performance fee. */
  quarterlyNetApy?: Maybe<Array<FloatDataPoint>>;
  /** Value of WAD shares in assets */
  sharePrice?: Maybe<Array<BigIntDataPoint>>;
  /** Value of WAD shares in USD */
  sharePriceUsd?: Maybe<Array<FloatDataPoint>>;
  /** Skim recipient. */
  skimRecipient?: Maybe<Array<AddressDataPoint>>;
  /** Total value of vault holdings, in underlying token units. */
  totalAssets?: Maybe<Array<BigIntDataPoint>>;
  /** Total value of vault holdings, in USD for display purpose. */
  totalAssetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Vault shares total supply. */
  totalSupply?: Maybe<Array<BigIntDataPoint>>;
  /** Weekly Vault APY excluding rewards, before deducting the performance fee. */
  weeklyApy?: Maybe<Array<FloatDataPoint>>;
  /** Weekly Vault APY including rewards, after deducting the performance fee. */
  weeklyNetApy?: Maybe<Array<FloatDataPoint>>;
  /** Yearly Vault APY excluding rewards, before deducting the performance fee. */
  yearlyApy?: Maybe<Array<FloatDataPoint>>;
  /** Yearly Vault APY including rewards, after deducting the performance fee. */
  yearlyNetApy?: Maybe<Array<FloatDataPoint>>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryAllTimeApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryAllTimeNetApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryCuratorArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryDailyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryDailyNetApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryFeeArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryFeeRecipientArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryGuardianArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryMonthlyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryMonthlyNetApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryNetApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryNetApyWithoutRewardsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryOwnerArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryQuarterlyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryQuarterlyNetApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistorySharePriceArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistorySharePriceUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistorySkimRecipientArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryTotalAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryTotalAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryTotalSupplyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryWeeklyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryWeeklyNetApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryYearlyApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Meta-Morpho vault history */
export interface VaultHistoryYearlyNetApyArgs {
  options?: InputMaybe<TimeseriesOptions>;
}

/** Vault Liquidity */
export interface VaultLiquidity {
  __typename?: 'VaultLiquidity';
  /** Vault withdrawable liquidity in underlying. */
  underlying: Scalars['BigInt'];
  /** Vault withdrawable liquidity in USD. */
  usd: Scalars['Float'];
}

/** Vault metadata */
export interface VaultMetadata {
  __typename?: 'VaultMetadata';
  curators: Array<VaultMetadataCurator>;
  description: Scalars['String'];
  forumLink?: Maybe<Scalars['String']>;
  image: Scalars['String'];
}

/** Vault metadata curator */
export interface VaultMetadataCurator {
  __typename?: 'VaultMetadataCurator';
  image: Scalars['String'];
  name: Scalars['String'];
  url: Scalars['String'];
  verified: Scalars['Boolean'];
}

export enum VaultOrderBy {
  Address = 'Address',
  Apy = 'Apy',
  CredoraRiskScore = 'CredoraRiskScore',
  Curator = 'Curator',
  DailyApy = 'DailyApy',
  DailyNetApy = 'DailyNetApy',
  Fee = 'Fee',
  Name = 'Name',
  NetApy = 'NetApy',
  TotalAssets = 'TotalAssets',
  TotalAssetsUsd = 'TotalAssetsUsd',
  TotalSupply = 'TotalSupply'
}

/** Vault pending cap */
export interface VaultPendingCap {
  __typename?: 'VaultPendingCap';
  market: Market;
  /** Pending supply cap */
  supplyCap: Scalars['BigInt'];
  /** Pending supply cap apply timestamp */
  validAt: Scalars['BigInt'];
}

/** MetaMorpho vault position */
export interface VaultPosition {
  __typename?: 'VaultPosition';
  /**
   * Value of vault shares held, in underlying token units.
   * @deprecated Use `state.assets` instead.
   */
  assets: Scalars['BigInt'];
  /**
   * Value of vault shares held, in USD for display purpose.
   * @deprecated Use `state.assetsUsd` instead.
   */
  assetsUsd?: Maybe<Scalars['Float']>;
  /** State history */
  historicalState?: Maybe<VaultPositionHistory>;
  id: Scalars['ID'];
  /**
   * Amount of vault shares
   * @deprecated Use `state.shares` instead.
   */
  shares: Scalars['BigInt'];
  /** Current state */
  state?: Maybe<VaultPositionState>;
  user: User;
  vault: Vault;
}

/** Filtering options for vault positions. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface VaultPositionFilters {
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  search?: InputMaybe<Scalars['String']>;
  /** Filter by greater than or equal to given amount of vault shares. */
  shares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of vault shares. */
  shares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by user address */
  userAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by user id */
  userId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars['String']>>;
}

/** Vault position state history */
export interface VaultPositionHistory {
  __typename?: 'VaultPositionHistory';
  /** Value of the position since its inception, in underlying assets. */
  assets?: Maybe<Array<BigIntDataPoint>>;
  /** Value of the position since its inception, in USD. */
  assetsUsd?: Maybe<Array<FloatDataPoint>>;
  /** Profit (from the underlying asset's price variation) & Loss (from bad debt socialization) of the position since its inception, in underlying assets. */
  pnl?: Maybe<Array<BigIntDataPoint>>;
  /** Profit (from the underlying asset's price variation) & Loss (from bad debt socialization) of the position since its inception, in USD for display purposes. */
  pnlUsd?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity of the position since its inception. */
  roe?: Maybe<Array<FloatDataPoint>>;
  /** Return Over Equity of the position since its inception, taking into account the underlying asset's price variation. */
  roeUsd?: Maybe<Array<FloatDataPoint>>;
  /** Value of the position since its inception, in vault shares. */
  shares?: Maybe<Array<BigIntDataPoint>>;
}


/** Vault position state history */
export interface VaultPositionHistoryAssetsArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Vault position state history */
export interface VaultPositionHistoryAssetsUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Vault position state history */
export interface VaultPositionHistoryPnlArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Vault position state history */
export interface VaultPositionHistoryPnlUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Vault position state history */
export interface VaultPositionHistoryRoeArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Vault position state history */
export interface VaultPositionHistoryRoeUsdArgs {
  options?: InputMaybe<TimeseriesOptions>;
}


/** Vault position state history */
export interface VaultPositionHistorySharesArgs {
  options?: InputMaybe<TimeseriesOptions>;
}

export enum VaultPositionOrderBy {
  Shares = 'Shares'
}

/** Vault position state */
export interface VaultPositionState {
  __typename?: 'VaultPositionState';
  /** The latest supply assets indexed for this position. */
  assets?: Maybe<Scalars['BigInt']>;
  /** The latest supply assets indexed for this position, in USD. */
  assetsUsd?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  /** Profit (from the collateral's price variation) & Loss (from the loan interest) of the position since its inception, in loan assets. */
  pnl?: Maybe<Scalars['BigInt']>;
  /** Profit (from the collateral's price variation) & Loss (from the loan interest) of the position since its inception, in USD. */
  pnlUsd?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the position since its inception. */
  roe?: Maybe<Scalars['Float']>;
  /** Return Over Equity of the position since its inception, taking into account the underlying asset's price variation. */
  roeUsd?: Maybe<Scalars['Float']>;
  /** The latest supply shares indexed for this position. */
  shares: Scalars['BigInt'];
  /** The latest update timestamp. */
  timestamp: Scalars['BigInt'];
}

/** Vault reallocate */
export interface VaultReallocate {
  __typename?: 'VaultReallocate';
  assets: Scalars['BigInt'];
  blockNumber: Scalars['BigInt'];
  caller: Scalars['Address'];
  hash: Scalars['HexString'];
  id: Scalars['ID'];
  logIndex: Scalars['Int'];
  market: Market;
  shares: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  type: VaultReallocateType;
  vault: Vault;
}

/** Filtering options for vault reallocates. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export interface VaultReallocateFilters {
  /** Filter by greater than or equal to given amount of market assets, in underlying token units */
  assets_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of market assets, in underlying token units */
  assets_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by greater than or equal to given amount of market shares */
  shares_gte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by lower than or equal to given amount of market shares */
  shares_lte?: InputMaybe<Scalars['BigInt']>;
  /** Filter by greater than or equal to given timestamp */
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  /** Filter by lower than or equal to given timestamp */
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  /** Filter by reallocate type */
  type_in?: InputMaybe<Array<VaultReallocateType>>;
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars['String']>>;
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars['String']>>;
}

export enum VaultReallocateOrderBy {
  Assets = 'Assets',
  Shares = 'Shares',
  Timestamp = 'Timestamp'
}

export enum VaultReallocateType {
  ReallocateSupply = 'ReallocateSupply',
  ReallocateWithdraw = 'ReallocateWithdraw'
}

/** MetaMorpho vault state */
export interface VaultState {
  __typename?: 'VaultState';
  /** All Time Vault APY excluding rewards, before deducting the performance fee. */
  allTimeApy?: Maybe<Scalars['Float']>;
  /** All Time Vault APY including rewards, after deducting the performance fee. */
  allTimeNetApy?: Maybe<Scalars['Float']>;
  /** Vault allocation on Morpho Blue markets. */
  allocation?: Maybe<Array<VaultAllocation>>;
  /** Vault APY excluding rewards, before deducting the performance fee. */
  apy: Scalars['Float'];
  /** Block number of the state */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Vault curator address. */
  curator: Scalars['Address'];
  /** Additional information about the curator address. */
  curatorMetadata?: Maybe<PaginatedAddressMetadata>;
  /**
   * Curators operating on this vault
   * @deprecated Work in progress
   */
  curators?: Maybe<Array<Curator>>;
  /** Daily Vault APY excluding rewards, before deducting the performance fee. */
  dailyApy?: Maybe<Scalars['Float']>;
  /** Daily Vault APY including rewards, after deducting the performance fee. */
  dailyNetApy?: Maybe<Scalars['Float']>;
  /** Vault performance fee. */
  fee: Scalars['Float'];
  /** Fee recipient address. */
  feeRecipient: Scalars['Address'];
  /** Guardian address. */
  guardian: Scalars['Address'];
  /** Additional information about the guardian address. */
  guardianMetadata?: Maybe<PaginatedAddressMetadata>;
  id: Scalars['ID'];
  /** Stores the total assets managed by this vault when the fee was last accrued, in underlying token units. */
  lastTotalAssets: Scalars['BigInt'];
  /** Monthly Vault APY excluding rewards, before deducting the performance fee. */
  monthlyApy?: Maybe<Scalars['Float']>;
  /** Monthly Vault APY including rewards, after deducting the performance fee. */
  monthlyNetApy?: Maybe<Scalars['Float']>;
  /** Vault APY including rewards and underlying yield, after deducting the performance fee. */
  netApy?: Maybe<Scalars['Float']>;
  /** Vault APY excluding rewards, after deducting the performance fee. */
  netApyWithoutRewards: Scalars['Float'];
  /** Owner address. */
  owner: Scalars['Address'];
  /** Additional information about the owner address. */
  ownerMetadata?: Maybe<PaginatedAddressMetadata>;
  /** Pending guardian address. */
  pendingGuardian?: Maybe<Scalars['Address']>;
  /** Pending guardian apply timestamp. */
  pendingGuardianValidAt?: Maybe<Scalars['BigInt']>;
  /** Pending owner address. */
  pendingOwner?: Maybe<Scalars['Address']>;
  /** Pending timelock in seconds. */
  pendingTimelock?: Maybe<Scalars['BigInt']>;
  /** Pending timelock apply timestamp. */
  pendingTimelockValidAt?: Maybe<Scalars['BigInt']>;
  /** Quarterly Vault APY excluding rewards, before deducting the performance fee. */
  quarterlyApy?: Maybe<Scalars['Float']>;
  /** Quarterly Vault APY including rewards, after deducting the performance fee. */
  quarterlyNetApy?: Maybe<Scalars['Float']>;
  /** Vault state rewards */
  rewards?: Maybe<Array<VaultStateReward>>;
  /** Value of WAD shares in assets */
  sharePrice?: Maybe<Scalars['BigInt']>;
  /** Value of WAD shares in USD */
  sharePriceUsd?: Maybe<Scalars['Float']>;
  /** Skim recipient address. */
  skimRecipient: Scalars['Address'];
  /** Timelock in seconds. */
  timelock: Scalars['BigInt'];
  /** Last update timestamp. */
  timestamp: Scalars['BigInt'];
  /** Total value of vault holdings, in underlying token units. */
  totalAssets: Scalars['BigInt'];
  /** Total value of vault holdings, in USD for display purpose. */
  totalAssetsUsd?: Maybe<Scalars['Float']>;
  /** Vault shares total supply. */
  totalSupply: Scalars['BigInt'];
  /** Weekly Vault APY excluding rewards, before deducting the performance fee. */
  weeklyApy?: Maybe<Scalars['Float']>;
  /** Weekly Vault APY including rewards, after deducting the performance fee. */
  weeklyNetApy?: Maybe<Scalars['Float']>;
  /** Yearly Vault APY excluding rewards, before deducting the performance fee. */
  yearlyApy?: Maybe<Scalars['Float']>;
  /** Yearly Vault APY including rewards, after deducting the performance fee. */
  yearlyNetApy?: Maybe<Scalars['Float']>;
}

/** MetaMorpho vault state rewards */
export interface VaultStateReward {
  __typename?: 'VaultStateReward';
  /** Amount of reward tokens earned per supplied token (annualized). Scaled to reward asset decimals. */
  amountPerSuppliedToken: Scalars['BigInt'];
  asset: Asset;
  /** Rewards APR. */
  supplyApr?: Maybe<Scalars['Float']>;
  /** Amount of reward tokens distributed to MetaMorpho vault suppliers (annualized). Scaled to reward asset decimals. */
  yearlySupplyTokens: Scalars['BigInt'];
}

/** Meta Morpho vault transaction data */
export interface VaultTransactionData {
  __typename?: 'VaultTransactionData';
  assets: Scalars['BigInt'];
  assetsUsd?: Maybe<Scalars['Float']>;
  shares: Scalars['BigInt'];
  vault: Vault;
}

/** Vault warning */
export interface VaultWarning {
  __typename?: 'VaultWarning';
  level: WarningLevel;
  metadata?: Maybe<CustomMetadata>;
  type: Scalars['String'];
}

export enum WarningLevel {
  Red = 'RED',
  Yellow = 'YELLOW'
}

export type GetVaultPositionsQueryVariables = Exact<{
  chainId: Scalars['Int'];
  address: Scalars['String'];
}>;


export type GetVaultPositionsQuery = { __typename?: 'Query', userByAddress: { __typename?: 'User', address: any, marketPositions: Array<{ __typename?: 'MarketPosition', market: { __typename?: 'Market', uniqueKey: any }, state?: { __typename?: 'MarketPositionState', borrowAssets?: any | null, borrowAssetsUsd?: number | null, supplyAssets?: any | null, supplyAssetsUsd?: number | null } | null }>, vaultPositions: Array<{ __typename?: 'VaultPosition', vault: { __typename?: 'Vault', address: any, name: string }, state?: { __typename?: 'VaultPositionState', assets?: any | null, assetsUsd?: number | null, shares: any } | null }>, transactions: Array<{ __typename?: 'Transaction', hash: any, timestamp: any, type: TransactionType }> } };


export const GetVaultPositionsDocument = gql`
    query GetVaultPositions($chainId: Int!, $address: String!) {
  userByAddress(chainId: $chainId, address: $address) {
    address
    marketPositions {
      market {
        uniqueKey
      }
      state {
        borrowAssets
        borrowAssetsUsd
        supplyAssets
        supplyAssetsUsd
      }
    }
    vaultPositions {
      vault {
        address
        name
      }
      state {
        assets
        assetsUsd
        shares
      }
    }
    transactions {
      hash
      timestamp
      type
    }
  }
}
    `;

/**
 * __useGetVaultPositionsQuery__
 *
 * To run a query within a React component, call `useGetVaultPositionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVaultPositionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVaultPositionsQuery({
 *   variables: {
 *      chainId: // value for 'chainId'
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetVaultPositionsQuery(baseOptions: Apollo.QueryHookOptions<GetVaultPositionsQuery, GetVaultPositionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVaultPositionsQuery, GetVaultPositionsQueryVariables>(GetVaultPositionsDocument, options);
      }
export function useGetVaultPositionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVaultPositionsQuery, GetVaultPositionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVaultPositionsQuery, GetVaultPositionsQueryVariables>(GetVaultPositionsDocument, options);
        }
export type GetVaultPositionsQueryHookResult = ReturnType<typeof useGetVaultPositionsQuery>;
export type GetVaultPositionsLazyQueryHookResult = ReturnType<typeof useGetVaultPositionsLazyQuery>;
export type GetVaultPositionsQueryResult = Apollo.QueryResult<GetVaultPositionsQuery, GetVaultPositionsQueryVariables>;
export function refetchGetVaultPositionsQuery(variables: GetVaultPositionsQueryVariables) {
      return { query: GetVaultPositionsDocument, variables: variables }
    }