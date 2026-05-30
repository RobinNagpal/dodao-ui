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
  KEY_FACTS = 'key-facts',
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
  // KEY_FACTS is saved in its own EtfKeyFactsReport table (not a category analysis).
  // We still provide a placeholder mapping to satisfy the Record<> type; it is not used.
  [EtfReportType.KEY_FACTS]: EtfAnalysisCategory.PerformanceAndReturns,
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
  [EtfReportType.KEY_FACTS]: 'US/etfs/key-facts',
  [EtfReportType.COMPETITION]: 'US/etfs/competition',
  [EtfReportType.FINAL_SUMMARY]: 'US/etfs/final-summary',
};

export interface EtfFinalSummaryResponse {
  summary: string;
}

/** The four category pass counts surfaced by the ETF cached-score row. */
export interface EtfCompetitorCachedScore {
  performanceAndReturnsScore: number;
  costEfficiencyAndTeamScore: number;
  riskAnalysisScore: number;
  futurePerformanceOutlookScore: number | null;
  finalScore: number;
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
    cachedScoreEntry?: EtfCompetitorCachedScore | null;
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
    cachedScoreEntry?: EtfCompetitorCachedScore | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
}

export interface EtfKeyFactsSimilarEtf {
  symbol: string;
  exchange: string;
}

/**
 * One green/red flag assessed against a specific ETF: a single ~2-line
 * `explanation` and a Pass/Fail verdict. `flag` echoes the category flag text
 * being judged.
 *
 * `oneLineExplanation` / `detailedExplanation` are the legacy two-line shape
 * kept optional so reports stored before the single-explanation change still
 * render (the UI falls back to them when `explanation` is absent).
 */
export interface EtfKeyFactsFlagAssessment {
  flag: string;
  explanation?: string;
  result: 'Pass' | 'Fail';
  oneLineExplanation?: string;
  detailedExplanation?: string;
}

/**
 * Goals (from the investor taxonomy) an ETF can help achieve, grouped under the
 * investor type that pursues them. `goalKeys` are keys of that investor type's
 * `etfInvestorGoals`.
 */
export interface EtfApplicableInvestorGoals {
  investorTypeKey: string;
  goalKeys: string[];
}

export interface EtfKeyFactsResponse {
  keyFacts: string;
  greenFlags: EtfKeyFactsFlagAssessment[];
  redFlags: EtfKeyFactsFlagAssessment[];
  similarEtfs: EtfKeyFactsSimilarEtf[];
  /** Investor goals this ETF can help achieve, grouped by investor type. */
  applicableInvestorGoals: EtfApplicableInvestorGoals[];
}

/**
 * Forward-return estimates produced as extra fields of the Future Performance
 * Outlook LLM response and stored in the EtfFutureReturns table. Each return is
 * an expected annualized percent; each reason is a ~3-line rationale.
 */
export interface EtfFutureReturnsResponse {
  expectedNext1YrReturns: number | null;
  expectedNext1YrReturnsReason: string | null;
  expectedNext3YrReturns: number | null;
  expectedNext3YrReturnsReason: string | null;
  expectedNext5YrReturns: number | null;
  expectedNext5YrReturnsReason: string | null;
}

export interface EtfAnalysisFactorDefinition {
  factorAnalysisKey: string;
  factorAnalysisTitle: string;
  factorAnalysisDescription: string;
  factorAnalysisMetrics?: string;
  /**
   * The group-specific perspective/comparison instruction for this factor, picked
   * from `EtfGroupFactorDefinition.groupInstructions` using the fund's group key.
   * Empty when the factor has no group-specific override.
   */
  factorAnalysisGroupInstructions?: string;
}

/**
 * Group-based factor definition. Each factor declares the ETF groups it applies
 * to; the pipeline selects factors by intersecting the fund's group (derived
 * from EtfStockAnalyzerInfo.category via etf-analysis-categories.json) with these.
 *
 * `groupInstructions` carries the 1-2 line perspective rule for each group the
 * factor applies to — the natural benchmark to compare against, the framing
 * retail care about, and any group-specific guardrails. The pipeline forwards
 * only the entry that matches the fund's group through to the prompt.
 */
export interface EtfGroupFactorDefinition {
  factorKey: string;
  factorTitle: string;
  factorDescription: string;
  factorMetrics?: string;
  /**
   * Either the sentinel `"all"` (the factor applies to every ETF group) or an
   * explicit array of group keys (e.g. `["leveraged-inverse"]`).
   */
  groups: 'all' | string[];
  groupInstructions?: Record<string, string>;
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
  group: string;
}

/**
 * One Mor category's prompt-instruction entry:
 *  - `mostImportant` (optional) — qualitative facts describing what this kind of
 *    fund IS (index/selection methodology, portfolio character, income & tax
 *    nature). Neutral context, no verdict and no numeric thresholds; the facts
 *    the key-facts prompt asks the LLM to surface for a specific ETF.
 *  - `greenFlags` — non-obvious signs of a strong fund in the category.
 *  - `redFlags` — non-obvious signs of a weak or risky fund. NOT the mirror-image
 *    negation of `greenFlags`; each is its own distinct failure mode, so a given
 *    dial appears on at most one side.
 * `greenFlags`/`redFlags` list only genuinely impactful, non-obvious signals (no
 * obvious basics like a plain low/high expense ratio). The helper that consumes
 * this renders the lists into a single markdown block with section headings,
 * plumbed through to all four ETF analysis prompts as `categoryInstructions`.
 */
export interface EtfMorCategoryInstructionEntry {
  mostImportant?: string[];
  greenFlags: string[];
  redFlags: string[];
}

/**
 * Mor-category-level prompt instructions stored separately from
 * `etf-analysis-categories.json`, split into one file per analysis group under
 * `src/etf-analysis/category-flags/` (e.g. `category-flags/broad-equity.json`).
 * Each file is a flat object keyed by category slug
 * (`slugifyEtfCategory(EtfCategoryToGroup.name)`, e.g. `large-blend`) — the same
 * identifier groups and category URLs use — mapping to an
 * {@link EtfMorCategoryInstructionEntry}. The files are imported (bundled) and
 * the lookup indexes into only the fund's group at analysis-generation time. The
 * same rendered block goes into all four ETF analysis prompts (Past Returns /
 * Cost & Team / Risk / Future Outlook).
 */
export type EtfCategoryFlagsFile = Record<string, EtfMorCategoryInstructionEntry>;

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
