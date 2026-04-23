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
  [EtfReportType.FINAL_SUMMARY]: 'US/etfs/final-summary',
};

export interface EtfFinalSummaryResponse {
  summary: string;
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
 * Target investor groups taxonomy. Each group is an investor archetype that an ETF
 * analysis can be written from the perspective of. Groups map onto the ETF groups
 * (and optionally specific Morningstar categories) defined in etf-analysis-categories.json.
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

/**
 * A single goal-persona — concrete enough to write ETF analysis against.
 * Used both as a top-level entry (for goals that don't need an audience wrapper,
 * e.g., first-time-investor) and as a nested entry inside an audience's goals[].
 */
export interface EtfInvestorGoal {
  key: string;
  name: string;
  shortDescription: string;
  profile: EtfInvestorProfile;
  analysisAngle: string;
  keyConsiderations: string[];
  redFlags: string[];
}

/**
 * A broad audience that contains multiple distinct goals worth analyzing
 * separately (e.g., HNW, pension/endowment/foundation, RIA). The audience
 * itself has only descriptive metadata; the analytical detail lives in goals[].
 */
export interface EtfInvestorAudience {
  key: string;
  name: string;
  shortDescription: string;
  goals: EtfInvestorGoal[];
}

/**
 * Heterogeneous: an entry is either a flat goal-persona (EtfInvestorGoal shape)
 * or an audience wrapper with nested goals (EtfInvestorAudience shape). Discriminate
 * by the presence of a `goals` array.
 */
export type EtfTargetInvestorGroup = EtfInvestorGoal | EtfInvestorAudience;

export function isEtfInvestorAudience(group: EtfTargetInvestorGroup): group is EtfInvestorAudience {
  return Array.isArray((group as EtfInvestorAudience).goals);
}

export interface EtfTargetInvestorGroupsConfig {
  description: string;
  investorGroups: EtfTargetInvestorGroup[];
}
