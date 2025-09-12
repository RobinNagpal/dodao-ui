// Types for ticker analysis categories
export enum TickerAnalysisCategory {
  BusinessAndMoat = 'BusinessAndMoat',
  FinancialStatementAnalysis = 'FinancialStatementAnalysis',
  PastPerformance = 'PastPerformance',
  FutureGrowth = 'FutureGrowth',
  FairValue = 'FairValue',
}

// Industry mappings
export const INDUSTRY_MAPPINGS = {
  REITS: 'Real Estate Investment Trusts',
  TECHNOLOGY: 'Technology',
  HEALTHCARE: 'Healthcare',
} as const;

// Sub-industry mappings
export const SUB_INDUSTRY_MAPPINGS = {
  RETAIL_REITS: 'Retail REITs',
  OFFICE_REITS: 'Office REITs',
  RESIDENTIAL_REITS: 'Residential REITs',
  INDUSTRIAL_REITS: 'Industrial REITs',
  SPECIALTY_REITS: 'Specialty REITs',
  HEALTHCARE_REITS: 'Healthcare REITs',
  HOTEL_AND_MOTEL_REITS: 'Hotel and Motel REITs',
  DIVERSIFIED_REITS: 'Diversified REITs',
  SOFTWARE: 'Software',
  SEMICONDUCTORS: 'Semiconductors',
  PHARMACEUTICALS: 'Pharmaceuticals',
  MEDICAL_DEVICES: 'Medical Devices',
} as const;

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
export const getIndustryDisplayName = (industryKey: string): string => {
  return INDUSTRY_MAPPINGS[industryKey as keyof typeof INDUSTRY_MAPPINGS] || industryKey;
};

export const getSubIndustryDisplayName = (subIndustryKey: string): string => {
  return SUB_INDUSTRY_MAPPINGS[subIndustryKey as keyof typeof SUB_INDUSTRY_MAPPINGS] || subIndustryKey;
};

// New investor display name function
export const getInvestorDisplayName = (investorKey: string): string => {
  return INVESTOR_MAPPINGS[investorKey as keyof typeof INVESTOR_MAPPINGS] || investorKey;
};

// Type definitions for better type safety
export type IndustryKey = keyof typeof INDUSTRY_MAPPINGS;
export type SubIndustryKey = keyof typeof SUB_INDUSTRY_MAPPINGS;
export type CategoryKey = TickerAnalysisCategory;
export type InvestorKey = keyof typeof INVESTOR_MAPPINGS;

// Arrays for dropdowns/selects
export const INDUSTRY_OPTIONS = Object.entries(INDUSTRY_MAPPINGS).map(([key, name]) => ({
  key,
  name,
}));

export const SUB_INDUSTRY_OPTIONS = Object.entries(SUB_INDUSTRY_MAPPINGS).map(([key, name]) => ({
  key,
  name,
}));

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAPPINGS).map(([key, name]) => ({
  key: key as TickerAnalysisCategory,
  name,
}));

export const INVESTOR_OPTIONS = Object.entries(INVESTOR_MAPPINGS).map(([key, name]) => ({
  key,
  name,
}));
