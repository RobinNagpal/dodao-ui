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
  CAPITAL_ALLOCATOR_PLATFORM = 'CAPITAL_ALLOCATOR_PLATFORM',
  EFFICIENT_SCALER = 'EFFICIENT_SCALER',
  INNOVATION_OPTIONALITY = 'INNOVATION_OPTIONALITY',
  REGULATORY_YIELD_ASSET = 'REGULATORY_YIELD_ASSET',
  STABLE_CASH_RETURNER = 'STABLE_CASH_RETURNER',
  CYCLE_ADVANTAGED_LEADER = 'CYCLE_ADVANTAGED_LEADER',
  TRANSITION_VALUE_PLAY = 'TRANSITION_VALUE_PLAY',
  CATALYST_TURNAROUND = 'CATALYST_TURNAROUND',
  EVENT_DRIVEN_SPECIAL = 'EVENT_DRIVEN_SPECIAL',
  DISTRESSED_OPTIONALITY = 'DISTRESSED_OPTIONALITY',
  STRUCTURAL_DECLINER = 'STRUCTURAL_DECLINER',
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
    one_liner: 'Durable moat compounding per-share intrinsic value with a long reinvestment runway and disciplined, accretive bolt-ons.',
    signal_checks: [
      'Through-cycle ROIC > WACC with a clear moat (switching costs, brand, network, or regulatory edge)',
      'Visible reinvestment runway (TAM/adjacencies/pricing power) plus bolt-on M&A executed at >10% IRR',
      'Strong retention and pricing power supporting steadily rising per-share cash generation',
    ],
  },
  [VerdictKey.CAPITAL_ALLOCATOR_PLATFORM]: {
    key: VerdictKey.CAPITAL_ALLOCATOR_PLATFORM,
    label: 'Capital Allocator Platform',
    one_liner: 'Decentralized model compounding via disciplined reinvestment, M&A, and capital discipline focused on per-share outcomes.',
    signal_checks: [
      'Track record of accretive bolt-ons or redeployments at >10% IRR',
      'Decentralized ops + capital discipline at hold level with explicit hurdle rates',
      'Buybacks below intrinsic value and earnings mix improving from reinvested segments',
    ],
  },
  [VerdictKey.EFFICIENT_SCALER]: {
    key: VerdictKey.EFFICIENT_SCALER,
    label: 'Efficient Scaler',
    one_liner: 'Proven product-market fit; growth comes with improving unit economics and widening margins today (not just planned).',
    signal_checks: [
      'Operating margins above peers and expanding with scale; contribution margins rising',
      'Unit economics improving now (faster CAC payback, cohort profitability improving)',
      'Net revenue retention trending up; NOT primarily an unproven option bet',
    ],
  },
  [VerdictKey.INNOVATION_OPTIONALITY]: {
    key: VerdictKey.INNOVATION_OPTIONALITY,
    label: 'Innovation Optionality',
    one_liner: 'Core business is steady; upside from credible innovation, IP, or platform expansion that the market prices lightly (option value <25% EV).',
    signal_checks: [
      'Stable core (high retention/recurring revenue or steady margins) funding new bets',
      'Innovation/IP pipeline with optionality valued at <25% of EV',
      'Evidence of early scaling or monetization path; NOT classified as Efficient Scaler unless unit economics are already improving now',
    ],
  },
  [VerdictKey.REGULATORY_YIELD_ASSET]: {
    key: VerdictKey.REGULATORY_YIELD_ASSET,
    label: 'Regulatory Yield Asset',
    one_liner: 'Quasi-bond equity: regulated or contracted cash flows (utilities/infra/PPAs/royalty-like) with inflation or rate-base linkage.',
    signal_checks: [
      'Revenue governed by ROE framework, PPA, or long-term take-or-pay/availability contracts',
      'Rate base growth or CPI-linked escalators drive earnings; predictable cost pass-throughs',
      'Leverage higher but coverage stable on a through-cycle basis',
    ],
  },
  [VerdictKey.STABLE_CASH_RETURNER]: {
    key: VerdictKey.STABLE_CASH_RETURNER,
    label: 'Stable Cash Returner',
    one_liner: 'Predictable cash engine with limited reinvestment needs; value realized via steady, well-funded dividends/buybacks.',
    signal_checks: [
      'High, steady FCF conversion with low variability through the cycle',
      'Revenues are regulated/contracted or entrenched; often with inflation-linked escalators',
      'Payout safety: dividends/buybacks fully funded by FCF with coverage comfortably >1.2–1.5×',
    ],
  },
  [VerdictKey.CYCLE_ADVANTAGED_LEADER]: {
    key: VerdictKey.CYCLE_ADVANTAGED_LEADER,
    label: 'Cycle-Advantaged Leader',
    one_liner: 'Cost-curve or pricing-power leader in cyclical markets that out-earns mid-cycle and withstands downturns.',
    signal_checks: [
      'Bottom-quartile cost position or structural pricing power with disciplined capacity adds',
      'Balance sheet sized for 20–30% price swings (ample liquidity, low break-even; prudent hedging)',
      'Positive through-cycle ROIC > WACC with FCF prioritized over volume growth',
    ],
  },
  [VerdictKey.TRANSITION_VALUE_PLAY]: {
    key: VerdictKey.TRANSITION_VALUE_PLAY,
    label: 'Transition Value Play',
    one_liner: 'Legacy cash generator transitioning toward sustainable or digital model with clear transformation milestones.',
    signal_checks: [
      'Declining or flat core offset by credible transformation capex with disclosed ROI',
      'Management transparency on milestones/targets and resourcing',
      'Mid-term earnings trough identifiable and bridgeable; NOT primarily a dated (≤12m) single event',
    ],
  },
  [VerdictKey.CATALYST_TURNAROUND]: {
    key: VerdictKey.CATALYST_TURNAROUND,
    label: 'Catalyst Turnaround',
    one_liner: 'Under-earning vs potential with specific, time-bound operational/structural fixes and early proof points.',
    signal_checks: [
      'Named catalysts with timelines and ROI targets (leadership, incentives, restructuring, spin/carve-out, digital build-out)',
      'Bridgeable earnings trough with adequate liquidity and manageable leverage',
      'Early proof points: margins/asset productivity/FCF conversion improving; NOT event-led as the primary thesis',
    ],
  },
  [VerdictKey.EVENT_DRIVEN_SPECIAL]: {
    key: VerdictKey.EVENT_DRIVEN_SPECIAL,
    label: 'Event-Driven Special',
    one_liner: 'Value gap driven by an identifiable, dated (≤12 months) hard event—merger, spin, litigation, or policy trigger.',
    signal_checks: [
      'Upcoming event with defined timeline and payoff asymmetry (≤6–12 months)',
      'Hard catalyst (deal close, ruling, restructuring) with credible financing/regulatory path',
      'Clear downside floor; event probability >60%; primary thesis is the event (not an operational turnaround)',
    ],
  },
  [VerdictKey.DISTRESSED_OPTIONALITY]: {
    key: VerdictKey.DISTRESSED_OPTIONALITY,
    label: 'Distressed Optionality',
    one_liner: 'Stressed balance sheet but asymmetric upside from recap, asset sales, or restructuring if the core is sound.',
    signal_checks: [
      'Valuation at or below liquidation/replacement value (deep discount to NAV)',
      'Defined catalyst path (recap, asset monetization, debt exchange) with 12–24 month window',
      'Operationally viable core post-repair (positive unit economics or cash breakeven ex-interest)',
    ],
  },
  [VerdictKey.STRUCTURAL_DECLINER]: {
    key: VerdictKey.STRUCTURAL_DECLINER,
    label: 'Structural Decliner',
    one_liner: 'Cash-generative but trapped in secular decline or tech lag; intrinsic value likely shrinking without a credible pivot.',
    signal_checks: [
      'Structural erosion: revenue CAGR < -3% and/or persistent share/margin loss',
      'Technology under-investment causing inefficiencies and share loss',
      'Financial strain (high leverage/refi risk or sustained negative FCF) with no credible, funded pivot plan',
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

// Analysis type constants to avoid hardcoded strings
export enum AnalysisTypeKey {
  FINANCIAL_ANALYSIS = 'financial-analysis',
  COMPETITION = 'competition',
  BUSINESS_AND_MOAT = 'business-and-moat',
  PAST_PERFORMANCE = 'past-performance',
  FUTURE_GROWTH = 'future-growth',
  FAIR_VALUE = 'fair-value',
  FUTURE_RISK = 'future-risk',
  FINAL_SUMMARY = 'final-summary',
  CACHED_SCORE = 'cached-score',
}

// Investor analysis prefix for report types
export const INVESTOR_ANALYSIS_PREFIX = 'investor-';

// Helper function to create investor analysis key
export const createInvestorAnalysisKey = (investorKey: string): string => {
  return `${INVESTOR_ANALYSIS_PREFIX}${investorKey}`;
};

export enum EvaluationResult {
  Pass = 'Pass',
  Fail = 'Fail',
}

export enum GenerationRequestStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Failed = 'Failed',
}
