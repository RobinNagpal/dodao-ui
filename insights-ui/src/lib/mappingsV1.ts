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

// Verdict types for investor analysis
export enum VerdictKey {
  FRANCHISE_COMPOUNDER = 'FRANCHISE_COMPOUNDER',
  STABLE_CASH_RETURNER = 'STABLE_CASH_RETURNER',
  EFFICIENT_SCALER = 'EFFICIENT_SCALER',
  EMERGING_PRODUCT_MARKET_FIT = 'EMERGING_PRODUCT_MARKET_FIT',
  CYCLE_ADVANTAGED_LEADER = 'CYCLE_ADVANTAGED_LEADER',
  CATALYST_TURNAROUND = 'CATALYST_TURNAROUND',
  AT_RISK_ECONOMICS = 'AT_RISK_ECONOMICS',
}

export interface VerdictDefinition {
  key: VerdictKey;
  label: string;
  one_liner: string;
  signal_checks: string[];
}

export const VERDICT_DEFINITIONS: Record<VerdictKey, VerdictDefinition> = {
  [VerdictKey.FRANCHISE_COMPOUNDER]: {
    key: VerdictKey.FRANCHISE_COMPOUNDER,
    label: 'Franchise Compounder',
    one_liner: 'Durable moat with abundant reinvestment avenues—intrinsic value compounds through cycles.',
    signal_checks: [
      'ROIC durably > WACC (through-cycle)',
      'Visible reinvestment runway (TAM, adjacencies, pricing power)',
      'Primary moat identifiable: network effects / embedded switching costs / toll-road infra / brand or regulatory advantage',
      'High retention or usage intensity and pricing power',
    ],
  },
  [VerdictKey.STABLE_CASH_RETURNER]: {
    key: VerdictKey.STABLE_CASH_RETURNER,
    label: 'Stable Cash Returner',
    one_liner: 'Predictable cash engine with limited organic runway—value realized via dividends/buybacks.',
    signal_checks: [
      'High, steady FCF conversion; low variability',
      'Modest growth; disciplined, repeatable capital returns',
      'Often regulated/contracted revenues or entrenched share',
    ],
  },
  [VerdictKey.EFFICIENT_SCALER]: {
    key: VerdictKey.EFFICIENT_SCALER,
    label: 'Efficient Scaler',
    one_liner: 'Product-market fit proven; growth comes with improving unit economics and operating leverage.',
    signal_checks: ['Contribution margins expanding; CAC/payback improving', 'Gross/EBIT margins widen with scale', 'Cohort profitability and NRR trending up'],
  },
  [VerdictKey.EMERGING_PRODUCT_MARKET_FIT]: {
    key: VerdictKey.EMERGING_PRODUCT_MARKET_FIT,
    label: 'Emerging Product-Market Fit',
    one_liner: 'Early traction with improving cohorts—quality plausible but execution-dependent.',
    signal_checks: [
      'Rising win rates/engagement; improving retention',
      'Clear path to positive unit economics articulated',
      'Pilot-to-deployment conversion improving',
    ],
  },
  [VerdictKey.CYCLE_ADVANTAGED_LEADER]: {
    key: VerdictKey.CYCLE_ADVANTAGED_LEADER,
    label: 'Cycle-Advantaged Leader',
    one_liner: 'Top-quartile cost/asset position in a cyclical market—out-earns mid-cycle and survives downturns.',
    signal_checks: [
      'Cost-curve leadership or structural pricing power',
      'Balance sheet sized for down-cycle; prudent hedging',
      'Positive through-cycle ROIC; disciplined capacity adds',
    ],
  },
  [VerdictKey.CATALYST_TURNAROUND]: {
    key: VerdictKey.CATALYST_TURNAROUND,
    label: 'Catalyst Turnaround',
    one_liner: 'Under-earning vs potential with specific, credible, time-bound fixes.',
    signal_checks: [
      'Identified levers (leadership, incentives, restructuring, spin/carve-out)',
      'Milestones with timelines/targets and accountability',
      'Early proof points on margins/asset productivity',
    ],
  },
  [VerdictKey.AT_RISK_ECONOMICS]: {
    key: VerdictKey.AT_RISK_ECONOMICS,
    label: 'At-Risk Economics',
    one_liner: 'Durability in doubt due to financial strain or secular erosion—intrinsic value likely shrinking.',
    signal_checks: [
      'Financial: leverage/refi risk/covenant pressure/negative FCF',
      'Structural: persistent share/margin loss, platform/regulatory dependency, deteriorating unit economics',
    ],
  },
};

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
