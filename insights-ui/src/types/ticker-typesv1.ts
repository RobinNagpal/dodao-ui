import { VsCompetition } from '@/app/stocks/[exchange]/[ticker]/page';
import { TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import { CompetitorTicker } from '@/utils/ticker-v1-model-utils';
import { TickerV1, TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';

export interface TickerWithIndustryNames extends TickerV1 {
  industryName: string;
  subIndustryName: string;
}

export interface FilteredTicker extends TickerWithIndustryNames {
  categoryScores: {
    [key in TickerAnalysisCategory]?: number;
  };
  totalScore: number;
}

// Basic ticker info for ticker management
export interface BasicTickerInfo {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  websiteUrl: string | null;
  stockAnalyzeUrl: string;
  cachedScoreEntry: {
    finalScore: number;
  } | null;
}

export interface BasicTickersResponse {
  tickers: BasicTickerInfo[];
  count: number;
}

export interface ReportTickersResponse {
  tickers: TickerWithMissingReportInfo[];
  count: number;
  missingCount: number;
  partialCount: number;
  completeCount: number;
}

export type CompetitionResponse = {
  vsCompetition: VsCompetition | null;
  competitorTickers: CompetitorTicker[];
};

export interface IndustryWithSubIndustries extends TickerV1Industry {
  subIndustries: TickerV1SubIndustry[];
}

export interface IndustryWithSubIndustries extends TickerV1Industry {
  subIndustries: TickerV1SubIndustry[];
}

export interface TickerV1WithIndustryAndSubIndustry extends TickerV1 {
  industry: TickerV1Industry;
  subIndustry: TickerV1SubIndustry;
}
/**
 * Adds computed ticker counts for both industry and sub-industry rows.
 */
export interface SubIndustryWithCount extends TickerV1SubIndustry {
  tickerCount: number;
}

export interface IndustryWithSubIndustriesAndCounts extends TickerV1Industry {
  subIndustries: SubIndustryWithCount[];
  /** Sum of all tickers in this industry's sub-industries */
  tickerCount: number;
}

export interface AnalysisTypeInfo {
  key: ReportType;
  label: string;
}

export enum InvestorTypes {
  WARREN_BUFFETT = 'WARREN_BUFFETT',
  CHARLIE_MUNGER = 'CHARLIE_MUNGER',
  BILL_ACKMAN = 'BILL_ACKMAN',
}
// Analysis type constants to avoid hardcoded strings

// Combined enum for report types (both regular analysis and investor analysis)
export enum ReportType {
  // Regular analysis types
  FINANCIAL_ANALYSIS = 'financial-analysis',
  COMPETITION = 'competition',
  BUSINESS_AND_MOAT = 'business-and-moat',
  PAST_PERFORMANCE = 'past-performance',
  FUTURE_GROWTH = 'future-growth',
  FAIR_VALUE = 'fair-value',
  FUTURE_RISK = 'future-risk',
  FINAL_SUMMARY = 'final-summary',

  // Investor analysis types
  WARREN_BUFFETT = 'investor-WARREN_BUFFETT',
  CHARLIE_MUNGER = 'investor-CHARLIE_MUNGER',
  BILL_ACKMAN = 'investor-BILL_ACKMAN',
}

// Common analysis types using constants
export const analysisTypes: AnalysisTypeInfo[] = [
  { key: ReportType.FINANCIAL_ANALYSIS, label: 'Financial Analysis' },
  { key: ReportType.COMPETITION, label: 'Competition' },
  { key: ReportType.BUSINESS_AND_MOAT, label: 'Business & Moat' },
  { key: ReportType.PAST_PERFORMANCE, label: 'Past Performance' },
  { key: ReportType.FUTURE_GROWTH, label: 'Future Growth' },
  { key: ReportType.FAIR_VALUE, label: 'Fair Value' },
  { key: ReportType.FUTURE_RISK, label: 'Future Risk' },
  { key: ReportType.FINAL_SUMMARY, label: 'Final Summary' },
  { key: ReportType.WARREN_BUFFETT, label: 'Warren Buffett Analysis' },
  { key: ReportType.CHARLIE_MUNGER, label: 'Charlie Munger Analysis' },
  { key: ReportType.BILL_ACKMAN, label: 'Bill Ackman Analysis' },
];

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
};

// Investor mappings
export const INVESTOR_MAPPINGS = {
  [InvestorTypes.WARREN_BUFFETT]: 'Warren Buffett',
  [InvestorTypes.CHARLIE_MUNGER]: 'Charlie Munger',
  [InvestorTypes.BILL_ACKMAN]: 'Bill Ackman',
};

export const FALLBACK_INVESTOR_MAPPINGS = {
  [ReportType.WARREN_BUFFETT]: 'Warren Buffett',
  [ReportType.CHARLIE_MUNGER]: 'Charlie Munger',
  [ReportType.BILL_ACKMAN]: 'Bill Ackman',
};

export const INVESTOR_OPTIONS = Object.entries(INVESTOR_MAPPINGS).map(([key, name]) => ({
  key,
  name,
}));

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

export type InvestorKey = keyof typeof INVESTOR_MAPPINGS;

// Verdict types for investor analysis
export enum VerdictKey {
  ENDURING_VALUE_BUILDER = 'ENDURING_VALUE_BUILDER',
  CAPITAL_ALLOCATOR_PLATFORM = 'CAPITAL_ALLOCATOR_PLATFORM',
  EFFICIENT_SCALER = 'EFFICIENT_SCALER',
  INNOVATION_OPTIONALITY = 'INNOVATION_OPTIONALITY',
  CYCLE_ADVANTAGED_LEADER = 'CYCLE_ADVANTAGED_LEADER',
  STABLE_CASH_RETURNER = 'STABLE_CASH_RETURNER',
  BALANCE_SHEET_LENDER = 'BALANCE_SHEET_LENDER',
  RISK_UNDERWRITER_FLOAT = 'RISK_UNDERWRITER_FLOAT',
  REGULATORY_YIELD_ASSET = 'REGULATORY_YIELD_ASSET',
  DEVELOPER_OPERATOR_NAV_CYCLE = 'DEVELOPER_OPERATOR_NAV_CYCLE',
  TRANSITION_VALUE_PLAY = 'TRANSITION_VALUE_PLAY',
  RESOURCE_EXTRACTOR_RESERVE_REPLACER = 'RESOURCE_EXTRACTOR_RESERVE_REPLACER',
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
  score: number;
}

export const VERDICT_DEFINITIONS: Record<VerdictKey, VerdictDefinition> = {
  [VerdictKey.ENDURING_VALUE_BUILDER]: {
    key: VerdictKey.ENDURING_VALUE_BUILDER,
    label: 'Enduring Value Builder',
    one_liner:
      'A great business with a strong moat that keeps reinvesting its own profits at high returns inside the core business. As a result, cash earned per share climbs steadily for many years.',
    signal_checks: [
      "Over a full cycle, the profit made on each dollar invested is about 3%+ higher than the company's financing cost (returns beat cost of capital by ~300 bps) and there is a clear moat (switching costs, brand, network, or regulatory advantage).",
      'Reinvests 40%+ of free cash flow (cash left after running the business) back into the core at real returns above 10%; growth is mainly organic, not driven by acquisitions.',
      'Per-share cash generation rises 5%+ per year with share count flat or falling; NOT a Capital Allocator Platform (i.e., value creation is not mostly from deals/buybacks).',
    ],
    score: 10,
  },
  [VerdictKey.CAPITAL_ALLOCATOR_PLATFORM]: {
    key: VerdictKey.CAPITAL_ALLOCATOR_PLATFORM,
    label: 'Capital Allocator Platform',
    one_liner:
      'An owner-operator that compounds value mostly by smart deal-making and capital moves (buying companies, buying back shares, recycling assets) with strict hurdles, all focused on per-share outcomes.',
    signal_checks: [
      'In the last ~5 years, more than half of value creation came from external moves (M&A, buybacks, spins/asset recycling) earning >10% returns.',
      'Decentralized operating model with explicit hurdle rates and disciplined capital allocation at the holding-company level.',
      'Buys back stock below intrinsic value and per-share metrics improve; NOT Enduring Value Builder when organic reinvestment is 40%+ of free cash flow.',
    ],
    score: 9,
  },
  [VerdictKey.EFFICIENT_SCALER]: {
    key: VerdictKey.EFFICIENT_SCALER,
    label: 'Efficient Scaler',
    one_liner:
      'Product–market fit is proven and growth is already profitable. As the business scales, unit economics improve and margins widen today (not just in a plan).',
    signal_checks: [
      'Revenue grows 20%+ year over year and operating margin expands by 1+ percentage point; contribution margins are rising.',
      'Customers pay back acquisition cost fast (LTV/CAC ≥ 3x and payback ≤ 12 months); customer cohorts turn profitable on schedule; if subscription, net revenue retention ≥ 110%.',
      'NOT Innovation Optionality (where most upside is still a future bet) and NOT an event-led story.',
    ],
    score: 8,
  },
  [VerdictKey.INNOVATION_OPTIONALITY]: {
    key: VerdictKey.INNOVATION_OPTIONALITY,
    label: 'Innovation Optionality',
    one_liner:
      'A steady core business funds credible new products or IP. The market prices those new bets lightly today, so they are upside options rather than the main driver.',
    signal_checks: [
      'Core is steady (good retention/recurring revenue or stable margins) and represents about 70%+ of company value.',
      "Innovation pipeline is real but modestly priced (the market assigns roughly 25% or less of the company's value to these new bets); unit economics are not yet at Efficient Scaler quality.",
      'NOT Efficient Scaler and NOT Event-Driven Special.',
    ],
    score: 7,
  },
  [VerdictKey.CYCLE_ADVANTAGED_LEADER]: {
    key: VerdictKey.CYCLE_ADVANTAGED_LEADER,
    label: 'Cycle-Advantaged Leader',
    one_liner:
      'Leader in a cyclical industry that sits low on the cost curve or has pricing power. It stays cash-generative in downturns and out-earns peers across the cycle.',
    signal_checks: [
      'Bottom-quartile cost position or structural pricing power with disciplined capacity additions.',
      'Remains free-cash-flow positive even if prices fall 20–30%; prudent hedging; mid-cycle net debt/EBITDA ≤ 1.5x.',
      'Through-cycle returns exceed financing cost; NOT a resource extractor with depleting reserves.',
    ],
    score: 7,
  },
  [VerdictKey.STABLE_CASH_RETURNER]: {
    key: VerdictKey.STABLE_CASH_RETURNER,
    label: 'Stable Cash Returner',
    one_liner:
      'A mature, predictable cash machine with limited need to reinvest. Most of the value shows up as steady dividends and/or buybacks that are well covered by cash.',
    signal_checks: [
      'Converts 80%+ of earnings into free cash flow with low volatility across a cycle.',
      'Pays out 50%+ of normalized free cash flow with comfortable coverage (≥ 1.5x); reinvests 30% or less.',
      "Less than 70% of revenue is regulated/contracted (otherwise it's a Regulatory Yield Asset).",
    ],
    score: 6,
  },
  [VerdictKey.BALANCE_SHEET_LENDER]: {
    key: VerdictKey.BALANCE_SHEET_LENDER,
    label: 'Balance-Sheet Lender',
    one_liner:
      'Banks and similar lenders where earnings come from the spread between what they earn on loans and what they pay on funding, plus credit quality. Discipline in funding, underwriting, and capital is key.',
    signal_checks: [
      "Cheap, sticky funding drives resilience (core customer deposits are 70%+ of funding and deposit rates don't spike too fast).",
      'Credit losses and provisions sit within historical ranges thanks to conservative underwriting and mix.',
      'Strong capital and liquidity (CET1/LCR above targets) and interest-rate/ALM risks within limits; NOT an insurance underwriter (that would be Risk Underwriter & Float).',
    ],
    score: 6,
  },
  [VerdictKey.RISK_UNDERWRITER_FLOAT]: {
    key: VerdictKey.RISK_UNDERWRITER_FLOAT,
    label: 'Risk Underwriter & Float',
    one_liner:
      'Insurance economics: make an underwriting profit (or at least break even) and invest the float safely and productively. Value compounds across cycles when both are done well.',
    signal_checks: [
      'Underwriting is profitable through the cycle (combined ratio ≤ 100% with low swings); pricing is adequate and reserves conservative.',
      'Float (policyholder funds held before claims) is durable and growing; assets are matched in duration and quality to liabilities.',
      'Capital is comfortably above regulatory needs and reinsurance limits catastrophe risk; NOT a bank/lender.',
    ],
    score: 6,
  },
  [VerdictKey.REGULATORY_YIELD_ASSET]: {
    key: VerdictKey.REGULATORY_YIELD_ASSET,
    label: 'Regulatory Yield Asset',
    one_liner:
      'Utility/infra-like equity that behaves a bit like a bond: cash flows are mostly set by contracts or regulators and often rise with inflation or a growing rate base.',
    signal_checks: [
      'At least ~70% of revenue comes from regulated frameworks (allowed ROE), power purchase agreements, or long take-or-pay/availability contracts with cost pass-throughs.',
      'Earnings growth is driven by expanding the regulated asset base or CPI-linked escalators.',
      'Leverage can be higher, but coverage remains stable through cycles; NOT a developer/operator REIT and NOT a Stable Cash Returner when regulation/contracting is ≥ 70%.',
    ],
    score: 5,
  },
  [VerdictKey.DEVELOPER_OPERATOR_NAV_CYCLE]: {
    key: VerdictKey.DEVELOPER_OPERATOR_NAV_CYCLE,
    label: 'Developer–Operator NAV Cycle',
    one_liner:
      'Real-asset developer/owner (e.g., REITs, pipelines, data centers) that creates value when project returns exceed funding costs and capital is recycled based on discount/premium to NAV.',
    signal_checks: [
      'Visible value creation: pipeline IRRs exceed funding cost by roughly 3–5 percentage points and pre-leasing/absorption is on track.',
      'Prudent balance sheet (LTV and interest cover within targets) and diverse funding with limited equity dilution.',
      'Disciplined recycling based on price-to-NAV; NOT a Regulatory Yield Asset (no regulated rate base) and NOT a Stable Cash Returner if payout is < 50% of FCF.',
    ],
    score: 5,
  },
  [VerdictKey.TRANSITION_VALUE_PLAY]: {
    key: VerdictKey.TRANSITION_VALUE_PLAY,
    label: 'Transition Value Play',
    one_liner: 'A legacy cash generator that is funding a pivot to a more durable, digital, or sustainable model. The plan is funded and milestones are clear.',
    signal_checks: [
      'Core business is flat to down up to ~10%, but spend on the new model has a disclosed return above funding cost by ~3%+ with a 12–36 month timeline.',
      'Liquidity runway of 24+ months and management reports progress against milestones.',
      'NOT an Event-Driven Special (no single hard event is the main thesis) and NOT Distressed Optionality (no near-term refinancing stress).',
    ],
    score: 4,
  },
  [VerdictKey.RESOURCE_EXTRACTOR_RESERVE_REPLACER]: {
    key: VerdictKey.RESOURCE_EXTRACTOR_RESERVE_REPLACER,
    label: 'Resource Extractor & Reserve Replacer',
    one_liner:
      'Energy/mining businesses with depleting assets. Value depends on replacing reserves cheaply, keeping costs low, and sizing spending for tough commodity cycles.',
    signal_checks: [
      'Replaces 100%+ of produced reserves over 3 years and sits low on the cost curve at a conservative commodity price deck (F&D and lifting costs are competitive).',
      'Spending and leverage are sized for downcycles; project IRRs clear the bar at cautious prices; permits/ESG/license are stable.',
      'Reserve life and decline profile are healthy; hedging is prudent; NOT a Cycle-Advantaged Leader in manufacturing/processing (i.e., no reserve depletion).',
    ],
    score: 4,
  },
  [VerdictKey.CATALYST_TURNAROUND]: {
    key: VerdictKey.CATALYST_TURNAROUND,
    label: 'Catalyst Turnaround',
    one_liner: 'Under-earning vs potential, with specific operational fixes underway and early proof points. The thesis is the fix, not a one-off event.',
    signal_checks: [
      'Named catalysts with a 4–8 quarter timetable and clear ROI targets (leadership change, incentives, restructuring, mix, digital rebuild).',
      'Earnings trough is bridgeable with adequate liquidity; at least a ~300 bps margin gap vs peers is closing on plan.',
      "NOT mainly a dated, hard event (that's Event-Driven Special) and NOT a balance-sheet stress story (that's Distressed Optionality).",
    ],
    score: 3,
  },
  [VerdictKey.EVENT_DRIVEN_SPECIAL]: {
    key: VerdictKey.EVENT_DRIVEN_SPECIAL,
    label: 'Event-Driven Special',
    one_liner:
      'The main reason to own the stock is a near-dated hard event (6–12 months) like a merger close, court ruling, or policy decision with clear upside and a credible path.',
    signal_checks: [
      'A specific event within 6–12 months with >60% estimated chance of success and a clear payoff if it lands.',
      'Financing/regulatory path is realistic and there is a downside floor (e.g., break fee or asset value).',
      'Primary thesis is the event; NOT an operational turnaround and NOT primarily about fixing a stressed balance sheet.',
    ],
    score: 2,
  },
  [VerdictKey.DISTRESSED_OPTIONALITY]: {
    key: VerdictKey.DISTRESSED_OPTIONALITY,
    label: 'Distressed Optionality',
    one_liner:
      'Balance sheet is tight (debt/refi risk), but there is a plausible repair plan and meaningful upside if the company executes. The core business can at least break even on cash before interest.',
    signal_checks: [
      'Valuation sits at or below liquidation/NAV and there is visible stress: near-term maturities (≤ 24 months) or high leverage (> 5x) or low interest coverage (< 1.5x).',
      'There is a defined path (recap, asset sales, debt exchange) within 12–24 months and the core is cash breakeven before interest costs.',
      "NOT just a single event without balance-sheet stress (that's Event-Driven Special) and NOT a secular no-hope story (that's Structural Decliner).",
    ],
    score: 1,
  },
  [VerdictKey.STRUCTURAL_DECLINER]: {
    key: VerdictKey.STRUCTURAL_DECLINER,
    label: 'Structural Decliner',
    one_liner:
      'A business shrinking for structural reasons (technology, competition, behavior change) with no credible, funded plan to fix it. Intrinsic value is likely falling over time.',
    signal_checks: [
      'Revenue falls (about −3% CAGR or worse) and/or share and margins erode for 3+ years.',
      'Under-investment in product/tech/service shows up as customer churn or obsolescence.',
      "No credible, funded pivot (otherwise it's a Transition Value Play) and no time-bound operational catalysts (otherwise it's a Catalyst Turnaround/Event-Driven Special).",
    ],
    score: 0,
  },
};
