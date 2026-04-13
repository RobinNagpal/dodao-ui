import { CompetitionAnalysis as CompetitionAnalysisType } from '@/types/public-equity/analysis-factors-types';

export interface StockFundamentalsSummary {
  marketCap?: string;
  revenueTtm?: string;
  netIncomeTtm?: string;
  sharesOut?: string;
  epsTtm?: number;
  peRatio?: number;
  forwardPE?: number;
  dividend?: {
    amount?: number;
    yieldPct?: string;
  };
  exDividendDate?: Date;
  volume?: number;
  averageVolume?: number;
  open?: number;
  previousClose?: number;
  daysRange?: {
    low: number;
    high: number;
  };
  week52Range?: {
    low: number;
    high: number;
  };
  beta?: number;
  rsi?: number;
  earningsDate?: Date;
}

export interface DividendMeta {
  currency?: string;
}

export interface DividendSummary {
  annualDividend?: number;
  yieldPct?: string;
  exDividendDate?: Date;
  payoutFrequency?: string;
  payoutRatioPct?: string;
  dividendGrowth1Y?: string;
  currency?: string;
}

export interface DividendHistoryRow {
  exDividendDate?: Date;
  amount?: number;
  currency?: string;
  recordDate?: Date;
  payDate?: Date;
}

export interface DividendsData {
  meta: DividendMeta;
  summary: DividendSummary;
  history: DividendHistoryRow[];
}

// Common Financial Meta (used by all statement types)
export interface FinancialMeta {
  currency?: string;
  unit?: string;
  fiscalYearNote?: string;
}

// Base Financial Period Type (common structure)
export interface BaseFinancialPeriod {
  periodEnd?: string;
  values: Record<string, string | number | null>;
}

// Balance Sheet Types
export interface BalanceAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface BalanceQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface BalanceAnnualData {
  meta: FinancialMeta;
  periods: BalanceAnnualPeriod[];
}

export interface BalanceQuarterlyData {
  meta: FinancialMeta;
  periods: BalanceQuarterlyPeriod[];
}

// Income Statement Types
export interface IncomeAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface IncomeQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface IncomeAnnualData {
  meta: FinancialMeta;
  periods: IncomeAnnualPeriod[];
}

export interface IncomeQuarterlyData {
  meta: FinancialMeta;
  periods: IncomeQuarterlyPeriod[];
}

// Cash Flow Types
export interface CashFlowAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface CashFlowQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface CashFlowAnnualData {
  meta: FinancialMeta;
  periods: CashFlowAnnualPeriod[];
}

export interface CashFlowQuarterlyData {
  meta: FinancialMeta;
  periods: CashFlowQuarterlyPeriod[];
}

// Ratios Types
export interface RatiosAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface RatiosQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface RatiosAnnualData {
  meta: FinancialMeta;
  periods: RatiosAnnualPeriod[];
}

export interface RatiosQuarterlyData {
  meta: FinancialMeta;
  periods: RatiosQuarterlyPeriod[];
}

// KPIs Types
export interface KpisAnnualPeriod extends BaseFinancialPeriod {
  fiscalYear: string;
}

export interface KpisQuarterlyPeriod extends BaseFinancialPeriod {
  fiscalQuarter: string;
}

export interface KpisAnnualData {
  meta: FinancialMeta;
  periods: KpisAnnualPeriod[];
}

export interface KpisQuarterlyData {
  meta: FinancialMeta;
  periods: KpisQuarterlyPeriod[];
}

export type TopCompaniesToConsider = CompetitionAnalysisType;

export interface SourceLink {
  uri: string;
  title?: string;
}

export type SourceLinks = SourceLink[];

// -----------------------------
// ETF quote scraper JSON types
// -----------------------------

export interface EtfMorOverview {
  name?: string;
  ticker?: string;
  exchange?: string;
  overviewMetrics?: Record<string, string>;
  marketData?: Record<string, string>;
}

export interface EtfMorStrategy {
  text?: string;
}

export interface EtfMorPeopleSummary {
  inceptionDate?: string;
  numberOfManagers?: string;
  longestTenure?: string;
  advisors?: string;
  averageTenure?: string;
}

export interface EtfMorAnalysisSection {
  pillar: string;
  date?: string;
  rating?: string;
  author?: string;
  content: string;
}

export interface EtfMorAnalysis {
  available: boolean;
  medalistRating?: string;
  headline?: string;
  sections: EtfMorAnalysisSection[];
}

export interface EtfMorReturnsRow {
  label: string;
  values: Record<string, string>;
}

export type EtfMorReturnsRows = EtfMorReturnsRow[];

export interface EtfMorHolding {
  name: string;
  portfolioWeight?: string;
  marketValue?: string;
  sector?: string;
}

export interface EtfMorHoldings {
  currentPortfolioDate?: string;
  equityHoldings?: string;
  bondHoldings?: string;
  otherHoldings?: string;
  pctAssetsInTop10?: string;
  topHoldings: EtfMorHolding[];
}

// --------------------------------
// ETF people fetcher JSON types
// --------------------------------

export interface EtfMorCurrentManager {
  name: string;
  startDate?: string;
  endDate?: string;
  dateRangeText?: string;
}

export type EtfMorCurrentManagers = EtfMorCurrentManager[];

// ----------------------------
// ETF risk fetcher JSON types
// ----------------------------

export type EtfMorRiskPeriod = '3-Yr' | '5-Yr' | '10-Yr';

export interface EtfMorRiskScoreBlock {
  riskScore?: string;
  riskLevel?: string;
}

export interface EtfMorRiskReturnBlock {
  riskVsCategory?: string;
  returnVsCategory?: string;
}

export interface EtfMorRiskTableRow {
  label: string;
  values: Record<string, string>;
}

export interface EtfMorRiskTable {
  columns: string[];
  rows: EtfMorRiskTableRow[];
}

export interface EtfMorMarketVolatilityMeasures {
  captureRatios?: EtfMorRiskTable;
  drawdown?: EtfMorRiskTable;
  drawdownDates?: EtfMorRiskTable;
}

export interface EtfMorRiskPeriodData {
  period: EtfMorRiskPeriod;
  portfolioRiskScore?: EtfMorRiskScoreBlock;
  morAnalyzerRiskReturn?: EtfMorRiskReturnBlock;
  riskAndVolatilityMeasures?: EtfMorRiskTable;
  marketVolatilityMeasures?: EtfMorMarketVolatilityMeasures;
}

export type EtfMorRiskPeriods = Record<EtfMorRiskPeriod, EtfMorRiskPeriodData>;

// --------------------------------
// ETF portfolio scraper JSON types (/portfolio — etf-portfolio.ts)
// --------------------------------

export interface EtfMorPortfolioAssetAllocationRow {
  assetClass: string;
  investment?: string;
  net?: string;
  short?: string;
  long?: string;
  category?: string;
  index?: string;
}

export interface EtfMorPortfolioAssetAllocation {
  columns: string[];
  rows: EtfMorPortfolioAssetAllocationRow[];
}

export interface EtfMorPortfolioStyleMeasuresRow {
  measure: string;
  investment?: string;
  categoryAverage?: string;
  index?: string;
}

export interface EtfMorPortfolioStyleMeasures {
  rows: EtfMorPortfolioStyleMeasuresRow[];
}

export interface EtfMorPortfolioFixedIncomeStyleRow {
  measure: string;
  investment?: string;
  categoryAverage?: string;
}

export interface EtfMorPortfolioFixedIncomeStyle {
  rows: EtfMorPortfolioFixedIncomeStyleRow[];
}

export type EtfMorPortfolioSectorExposureType = 'EQUITY' | 'FIXEDINCOME';

export interface EtfMorPortfolioSectorExposureRow {
  sector: string;
  group?: string;
  investmentPct?: string;
  comparisonPct?: string;
}

export interface EtfMorPortfolioSectorExposure {
  type?: EtfMorPortfolioSectorExposureType;
  vsCategoryPct: EtfMorPortfolioSectorExposureRow[];
  vsIndexPct: EtfMorPortfolioSectorExposureRow[];
}

export interface EtfMorPortfolioBondBreakdownRow {
  grade: string;
  investmentPct?: string;
  comparisonPct?: string;
}

export interface EtfMorPortfolioBondBreakdown {
  vsCategoryPct: EtfMorPortfolioBondBreakdownRow[];
  vsIndexPct: EtfMorPortfolioBondBreakdownRow[];
}

export interface EtfMorPortfolioHoldingsSummary {
  equityHoldings?: string;
  bondHoldings?: string;
  otherHoldings?: string;
  totalHoldings?: string;
  pctAssetsInTop10Holdings?: string;
  reportedTurnoverPct?: string;
  turnoverAsOfDate?: string;
  womenDirectorsPct?: string;
  womenExecutivesPct?: string;
}

export interface EtfMorPortfolioHoldingRow {
  name: string;
  portfolioWeightPct?: string;
  firstBought?: string;
  marketValue?: string;
  marketValueAsOfDate?: string;
  currency?: string;
  oneYearReturn?: string;
  forwardPE?: string;
  maturityDate?: string;
  couponRate?: string;
  sector?: string;
}

export interface EtfMorPortfolioHoldings {
  summary: EtfMorPortfolioHoldingsSummary;
  columns: string[];
  holdings: EtfMorPortfolioHoldingRow[];
}

declare global {
  namespace PrismaJson {
    type CompetitionAnalysis = CompetitionAnalysisType;
    type TopCompaniesToConsider = CompetitionAnalysisType;
    // Stock analyzer types
    type StockFundamentalsSummary = StockFundamentalsSummary;
    type DividendsData = DividendsData;
    type BalanceAnnualData = BalanceAnnualData;
    type BalanceQuarterlyData = BalanceQuarterlyData;
    type IncomeAnnualData = IncomeAnnualData;
    type IncomeQuarterlyData = IncomeQuarterlyData;
    type CashFlowAnnualData = CashFlowAnnualData;
    type CashFlowQuarterlyData = CashFlowQuarterlyData;
    type RatiosAnnualData = RatiosAnnualData;
    type RatiosQuarterlyData = RatiosQuarterlyData;
    type KpisAnnualData = KpisAnnualData;
    type KpisQuarterlyData = KpisQuarterlyData;
    // LLM grounding sources
    type SourceLinks = SourceLinks;

    // ETF quote JSON shapes
    type EtfMorAnalysis = EtfMorAnalysis;
    type EtfMorReturnsRow = EtfMorReturnsRow;
    type EtfMorReturnsRows = EtfMorReturnsRows;
    type EtfMorHoldings = EtfMorHoldings;
    type EtfMorCurrentManager = EtfMorCurrentManager;
    type EtfMorCurrentManagers = EtfMorCurrentManagers;

    // ETF risk fetcher JSON shapes
    type EtfMorRiskScoreBlock = EtfMorRiskScoreBlock;
    type EtfMorRiskReturnBlock = EtfMorRiskReturnBlock;
    type EtfMorRiskTableRow = EtfMorRiskTableRow;
    type EtfMorRiskTable = EtfMorRiskTable;
    type EtfMorMarketVolatilityMeasures = EtfMorMarketVolatilityMeasures;
    type EtfMorRiskPeriodData = EtfMorRiskPeriodData;
    type EtfMorRiskPeriods = EtfMorRiskPeriods;

    // ETF portfolio JSON shapes
    type EtfMorPortfolioAssetAllocation = EtfMorPortfolioAssetAllocation;
    type EtfMorPortfolioStyleMeasures = EtfMorPortfolioStyleMeasures;
    type EtfMorPortfolioFixedIncomeStyle = EtfMorPortfolioFixedIncomeStyle;
    type EtfMorPortfolioSectorExposure = EtfMorPortfolioSectorExposure;
    type EtfMorPortfolioBondBreakdown = EtfMorPortfolioBondBreakdown;
    type EtfMorPortfolioHoldings = EtfMorPortfolioHoldings;
  }
}
