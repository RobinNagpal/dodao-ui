export enum EtfAnalysisCategory {
  PerformanceAndReturns = 'PerformanceAndReturns',
  CostEfficiencyAndTeam = 'CostEfficiencyAndTeam',
  RiskAnalysis = 'RiskAnalysis',
  FuturePerformanceOutlook = 'FuturePerformanceOutlook',
}

export enum EtfReportType {
  PERFORMANCE_AND_RETURNS = 'performance-and-returns',
  COST_EFFICIENCY_AND_TEAM = 'cost-efficiency-and-team',
  RISK_ANALYSIS = 'risk-analysis',
  FUTURE_PERFORMANCE_OUTLOOK = 'future-performance-outlook',
  INDEX_STRATEGY = 'index-strategy',
  COMPETITION = 'competition',
  FINAL_SUMMARY = 'final-summary',
}

export enum EtfGenerationRequestStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
}

export const ETF_REPORT_TYPE_TO_CATEGORY: Record<EtfReportType, EtfAnalysisCategory> = {
  [EtfReportType.PERFORMANCE_AND_RETURNS]: EtfAnalysisCategory.PerformanceAndReturns,
  [EtfReportType.COST_EFFICIENCY_AND_TEAM]: EtfAnalysisCategory.CostEfficiencyAndTeam,
  [EtfReportType.RISK_ANALYSIS]: EtfAnalysisCategory.RiskAnalysis,
  [EtfReportType.FUTURE_PERFORMANCE_OUTLOOK]: EtfAnalysisCategory.FuturePerformanceOutlook,
  // INDEX_STRATEGY is saved directly on the ETF record (not a category analysis).
  // We still provide a placeholder mapping to satisfy the Record<> type; it is not used.
  [EtfReportType.INDEX_STRATEGY]: EtfAnalysisCategory.PerformanceAndReturns,
  // COMPETITION lives in its own table (mirroring TickerV1VsCompetition), not a category analysis.
  // Placeholder mapping to satisfy the Record<> type; it is not used.
  [EtfReportType.COMPETITION]: EtfAnalysisCategory.PerformanceAndReturns,
  // FINAL_SUMMARY is saved directly on the ETF record (not a category analysis).
  // We still provide a placeholder mapping to satisfy the Record<> type; it is not used.
  [EtfReportType.FINAL_SUMMARY]: EtfAnalysisCategory.PerformanceAndReturns,
};

export const ETF_PROMPT_KEYS: Record<EtfReportType, string> = {
  [EtfReportType.PERFORMANCE_AND_RETURNS]: 'US/etfs/performance-returns',
  [EtfReportType.COST_EFFICIENCY_AND_TEAM]: 'US/etfs/cost-efficiency-team',
  [EtfReportType.RISK_ANALYSIS]: 'US/etfs/risk-analysis',
  [EtfReportType.FUTURE_PERFORMANCE_OUTLOOK]: 'US/etfs/future-performance-outlook',
  [EtfReportType.INDEX_STRATEGY]: 'US/etfs/index-strategy',
  [EtfReportType.COMPETITION]: 'US/etfs/competition',
  [EtfReportType.FINAL_SUMMARY]: 'US/etfs/final-summary',
};

export interface EtfFinalSummaryResponse {
  summary: string;
}

/**
 * ETF competitor record — mirrors the ticker `CompetitorTicker` shape but scoped to ETFs.
 * `companyName` is used as the peer name so the record stays shape-compatible with the
 * shared `CompetitorCard` rendering used on the stock competition page.
 */
export interface EtfCompetitor {
  companyName: string;
  companySymbol?: string;
  exchangeSymbol?: string;
  exchangeName?: string;
  detailedComparison?: string;
  /** True when the peer ETF exists in our system and can be linked to. */
  existsInSystem?: boolean;
  etfData?: {
    id: string;
    name: string;
    symbol: string;
    exchange: string;
  };
}

/**
 * ETF competition analysis payload — mirrors `TickerV1VsCompetition` (without the
 * `summary` field). `overallAnalysisDetails` is the long-form markdown body; the
 * per-competitor array is sent to the rendering layer via `EtfCompetitionResponse`.
 */
export interface EtfVsCompetition {
  overallAnalysisDetails: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface EtfCompetitionResponse {
  vsCompetition: EtfVsCompetition | null;
  competitors: EtfCompetitor[];
  etf?: {
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
}

export interface EtfIndexStrategySimilarEtf {
  symbol: string;
  exchange: string;
}

export interface EtfIndexStrategyResponse {
  indexStrategy: string;
  similarEtfs: EtfIndexStrategySimilarEtf[];
}

export interface EtfAnalysisFactorDefinition {
  factorAnalysisKey: string;
  factorAnalysisTitle: string;
  factorAnalysisDescription: string;
  factorAnalysisMetrics?: string;
}

/**
 * Group-based factor definition. Each factor declares the ETF groups it applies
 * to; the pipeline selects factors by intersecting the fund's group (derived
 * from EtfStockAnalyzerInfo.category via etf-analysis-categories.json) with these.
 */
export interface EtfGroupFactorDefinition {
  factorKey: string;
  factorTitle: string;
  factorDescription: string;
  factorMetrics?: string;
  groups: string[];
}

export interface EtfGroupBasedFactorsConfig {
  categoryKey: EtfAnalysisCategory;
  categoryName: string;
  categoryDescription: string;
  factors: EtfGroupFactorDefinition[];
}

export interface EtfGroup {
  key: string;
  name: string;
  description: string;
}

export interface EtfCategoryToGroup {
  name: string;
  numberOfStocks: number;
  group: string;
}

export interface EtfCategoriesConfig {
  groups: EtfGroup[];
  categories: EtfCategoryToGroup[];
}

export interface EtfFactorAnalysisResult {
  factorAnalysisKey: string;
  oneLineExplanation: string;
  detailedExplanation: string;
  result: 'Pass' | 'Fail';
}

export interface EtfCategoryAnalysisResponse {
  overallSummary: string;
  overallAnalysisDetails: string;
  factors: EtfFactorAnalysisResult[];
}

/**
 * ETF investor taxonomy. Two-level structure:
 *   - Level 1: EtfInvestor — a type of investor (retail, HNW, pension, etc.).
 *     Types are intentionally non-overlapping (each defined by a distinct funding
 *     source / governance / regulatory context).
 *   - Level 2: EtfInvestorGoal — a specific goal an investor of that type pursues
 *     when buying ETFs (e.g., "tax-efficient public-equity beta sleeve",
 *     "liability-driven investing"). Goals can recur across types but are framed
 *     for that type's specific perspective.
 */

export type EtfInvestorHorizon = 'Short (<1y)' | 'Medium (1-5y)' | 'Long (5-15y)' | 'Very Long (15y+)';

export type EtfInvestorRiskTolerance = 'Low' | 'Low-Moderate' | 'Moderate' | 'Moderate-High' | 'High' | 'Very High';

export type EtfInvestorPrimaryGoal =
  | 'Wealth Accumulation'
  | 'Income Generation'
  | 'Capital Preservation'
  | 'Tax Optimization'
  | 'Speculation / Trading'
  | 'Diversification / Hedging'
  | 'Thematic Exposure';

export type EtfInvestorIncomeNeed = 'None' | 'Modest' | 'High';

export type EtfInvestorTaxSensitivity = 'Low' | 'Moderate' | 'High';

export interface EtfInvestorProfile {
  investmentHorizon: EtfInvestorHorizon;
  riskTolerance: EtfInvestorRiskTolerance;
  primaryGoal: EtfInvestorPrimaryGoal;
  incomeNeed: EtfInvestorIncomeNeed;
  taxSensitivity: EtfInvestorTaxSensitivity;
  typicalInvestor: string;
}

/** A specific ETF recommended for a given goal. */
export interface EtfInvestorGoalEtf {
  symbol: string;
  name: string;
  exchange: string;
  why: string;
}

/** A specific goal an investor pursues when buying ETFs. */
export interface EtfInvestorGoal {
  key: string;
  name: string;
  shortDescription: string;
  profile: EtfInvestorProfile;
  analysisAngle: string;
  keyConsiderations: string[];
  redFlags: string[];
  etfs: EtfInvestorGoalEtf[];
}

/** A type of investor (retail, HNW, pension, etc.) with the goals they pursue. */
export interface EtfInvestor {
  key: string;
  name: string;
  shortDescription: string;
  etfInvestorGoals: EtfInvestorGoal[];
}

export interface EtfInvestorTaxonomyConfig {
  description: string;
  investors: EtfInvestor[];
}
