export enum EtfAnalysisCategory {
  PerformanceAndReturns = 'PerformanceAndReturns',
  CostEfficiencyAndTeam = 'CostEfficiencyAndTeam',
  RiskAnalysis = 'RiskAnalysis',
}

export enum EtfReportType {
  PERFORMANCE_AND_RETURNS = 'performance-and-returns',
  COST_EFFICIENCY_AND_TEAM = 'cost-efficiency-and-team',
  RISK_ANALYSIS = 'risk-analysis',
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
  // FINAL_SUMMARY is saved directly on the ETF record (not a category analysis).
  // We still provide a placeholder mapping to satisfy the Record<> type; it is not used.
  [EtfReportType.FINAL_SUMMARY]: EtfAnalysisCategory.PerformanceAndReturns,
};

export const ETF_PROMPT_KEYS: Record<EtfReportType, string> = {
  [EtfReportType.PERFORMANCE_AND_RETURNS]: 'US/etfs/performance-returns',
  [EtfReportType.COST_EFFICIENCY_AND_TEAM]: 'US/etfs/cost-efficiency-team',
  [EtfReportType.RISK_ANALYSIS]: 'US/etfs/risk-analysis',
  [EtfReportType.FINAL_SUMMARY]: 'US/etfs/final-summary',
};

export interface EtfFinalSummaryResponse {
  summary: string;
}

export interface EtfAnalysisFactorDefinition {
  factorAnalysisKey: string;
  factorAnalysisTitle: string;
  factorAnalysisDescription: string;
  factorAnalysisMetrics?: string;
}

export type EtfAssetClass = 'Equity' | 'Fixed Income' | 'Alternatives' | 'Commodity' | 'Asset Allocation' | 'Currency';

export interface EtfCategoryAnalysisFactors {
  categoryKey: EtfAnalysisCategory;
  categoryName: string;
  categoryDescription: string;
  /** Used by categories that have a single set of factors (e.g., CostEfficiencyAndTeam, RiskAnalysis) */
  factors?: EtfAnalysisFactorDefinition[];
  /** Used by categories that have asset-class-specific factors (e.g., PerformanceAndReturns) */
  factorsByAssetClass?: Record<EtfAssetClass, EtfAnalysisFactorDefinition[]>;
}

export interface EtfAnalysisFactorsConfig {
  categories: EtfCategoryAnalysisFactors[];
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
