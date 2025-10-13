// Types for ticker analysis categories
export enum TickerAnalysisCategory {
  BusinessAndMoat = 'BusinessAndMoat',
  FinancialStatementAnalysis = 'FinancialStatementAnalysis',
  PastPerformance = 'PastPerformance',
  FutureGrowth = 'FutureGrowth',
  FairValue = 'FairValue',
}

// Category mappings
export const CATEGORY_MAPPINGS = {
  [TickerAnalysisCategory.BusinessAndMoat]: 'Business & Moat Analysis',
  [TickerAnalysisCategory.FinancialStatementAnalysis]: 'Financial Statement Analysis',
  [TickerAnalysisCategory.PastPerformance]: 'Past Performance',
  [TickerAnalysisCategory.FutureGrowth]: 'Future Growth',
  [TickerAnalysisCategory.FairValue]: 'Fair Value',
} as const;

// Investor mappings
export const INVESTOR_MAPPINGS = {
  WARREN_BUFFETT: 'Warren Buffett',
  CHARLIE_MUNGER: 'Charlie Munger',
  BILL_ACKMAN: 'Bill Ackman',
} as const;

// Helper functions to get display names
export const getInvestorDisplayName = (investorKey: string): string => {
  return INVESTOR_MAPPINGS[investorKey as keyof typeof INVESTOR_MAPPINGS] || investorKey;
};

// Type definitions for better type safety
export type CategoryKey = TickerAnalysisCategory;
export type InvestorKey = keyof typeof INVESTOR_MAPPINGS;

// Arrays for dropdowns/selects
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAPPINGS).map(([key, name]) => ({
  key: key as TickerAnalysisCategory,
  name,
}));

export const INVESTOR_OPTIONS = Object.entries(INVESTOR_MAPPINGS).map(([key, name]) => ({
  key,
  name,
}));

export enum GenerationRequestStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
}
