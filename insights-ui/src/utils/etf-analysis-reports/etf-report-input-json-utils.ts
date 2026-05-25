import {
  EtfAnalysisCategory,
  EtfAnalysisFactorDefinition,
  EtfCategoriesConfig,
  EtfGroupBasedFactorsConfig,
  EtfGroupFactorDefinition,
  EtfMorCategoryInstructionsConfig,
} from '@/types/etf/etf-analysis-types';
import { serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import etfCategoriesRaw from '@/etf-analysis-data/etf-analysis-categories.json';
import etfMorCategoryInstructionsRaw from '@/etf-analysis-data/etf-mor-category-instructions.json';
import performanceAndReturnsRaw from '@/etf-analysis-data/etf-analysis-factors-performance-and-returns.json';
import costEfficiencyAndTeamRaw from '@/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json';
import riskAnalysisRaw from '@/etf-analysis-data/etf-analysis-factors-risk-analysis.json';
import futurePerformanceOutlookRaw from '@/etf-analysis-data/etf-analysis-factors-future-performance-outlook.json';
import { EtfWithAllData } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';

const DEFAULT_GROUP_KEY = 'broad-equity';

const categoriesConfig = etfCategoriesRaw as EtfCategoriesConfig;
const morCategoryInstructionsConfig = etfMorCategoryInstructionsRaw as EtfMorCategoryInstructionsConfig;
const performanceAndReturnsConfig = performanceAndReturnsRaw as EtfGroupBasedFactorsConfig;
const costEfficiencyAndTeamConfig = costEfficiencyAndTeamRaw as EtfGroupBasedFactorsConfig;
const riskAnalysisConfig = riskAnalysisRaw as EtfGroupBasedFactorsConfig;
const futurePerformanceOutlookConfig = futurePerformanceOutlookRaw as EtfGroupBasedFactorsConfig;

const CATEGORY_CONFIGS: Record<EtfAnalysisCategory, EtfGroupBasedFactorsConfig> = {
  [EtfAnalysisCategory.PerformanceAndReturns]: performanceAndReturnsConfig,
  [EtfAnalysisCategory.CostEfficiencyAndTeam]: costEfficiencyAndTeamConfig,
  [EtfAnalysisCategory.RiskAnalysis]: riskAnalysisConfig,
  [EtfAnalysisCategory.FuturePerformanceOutlook]: futurePerformanceOutlookConfig,
};

function normalizeGroupFactor(f: EtfGroupFactorDefinition, groupKey?: string): EtfAnalysisFactorDefinition {
  return {
    factorAnalysisKey: f.factorKey,
    factorAnalysisTitle: f.factorTitle,
    factorAnalysisDescription: f.factorDescription,
    factorAnalysisMetrics: f.factorMetrics,
    factorAnalysisGroupInstructions: groupKey ? f.groupInstructions?.[groupKey] : undefined,
  };
}

/**
 * Resolve the ETF group key (e.g. "broad-equity") from the fund's category string
 * (e.g. "Large Blend") as stored in EtfStockAnalyzerInfo.category. Returns undefined
 * when the category is unknown so callers can decide how to fall back.
 */
export function getEtfGroupKeyForCategory(category: string | null | undefined): string | undefined {
  if (!category) return undefined;
  const match = categoriesConfig.categories.find((c) => c.name === category);
  return match?.group;
}

function getGroupNameForGroupKey(groupKey: string): string {
  return categoriesConfig.groups.find((g) => g.key === groupKey)?.name ?? groupKey;
}

function getCategoriesForGroupKey(groupKey: string): string[] {
  return categoriesConfig.categories.filter((c) => c.group === groupKey).map((c) => c.name);
}

/**
 * Resolve the optional Mor-category-level instructions for the fund. Reads from
 * `etf-mor-category-instructions.json`, renders the `topQualities` bullets
 * under a "What separates top funds in this category" heading and the
 * `watchOuts` bullets under a "Category-specific risks to flag" heading.
 * The same block renders in all four ETF analysis prompts (Past Returns /
 * Cost & Team / Risk / Future Outlook). Returns undefined when the fund's
 * category has no entry registered, so the prompt template renders nothing
 * extra.
 */
function getCategoryInstructions(fundCategory: string | null | undefined): string | undefined {
  if (!fundCategory) return undefined;
  const entry = morCategoryInstructionsConfig.instructions[fundCategory];
  if (!entry) return undefined;
  const topQualities = entry.topQualities ?? [];
  const watchOuts = entry.watchOuts ?? [];
  if (topQualities.length === 0 && watchOuts.length === 0) return undefined;

  const sections: string[] = [];
  if (topQualities.length > 0) {
    sections.push(['**What separates top funds in this category:**', ...topQualities.map((b) => `- ${b}`)].join('\n'));
  }
  if (watchOuts.length > 0) {
    sections.push(['**Category-specific risks to flag:**', ...watchOuts.map((b) => `- ${b}`)].join('\n'));
  }
  return sections.join('\n\n');
}

function factorAppliesToGroup(f: EtfGroupFactorDefinition, groupKey: string): boolean {
  if (f.groups === 'all') return true;
  return f.groups.includes(groupKey);
}

function getGroupFactors(config: EtfGroupBasedFactorsConfig, groupKey: string): EtfAnalysisFactorDefinition[] {
  return config.factors.filter((f) => factorAppliesToGroup(f, groupKey)).map((f) => normalizeGroupFactor(f, groupKey));
}

/**
 * Get analysis factors for a given category. All three categories now use
 * group-based selection: the fund's EtfStockAnalyzerInfo.category is mapped
 * to a group (via etf-analysis-categories.json), then factors whose `groups`
 * includes that group are selected.
 */
export function getEtfAnalysisFactorsForCategory(categoryKey: EtfAnalysisCategory, params: { fundCategory?: string } = {}): EtfAnalysisFactorDefinition[] {
  const config = CATEGORY_CONFIGS[categoryKey];
  const groupKey = getEtfGroupKeyForCategory(params.fundCategory) || DEFAULT_GROUP_KEY;
  const factors = getGroupFactors(config, groupKey);
  if (factors.length > 0) return factors;
  return getGroupFactors(config, DEFAULT_GROUP_KEY);
}

/**
 * Find a factor definition by key for a given category. Searches across every
 * group definition in that category.
 */
export function findFactorDefinition(categoryKey: EtfAnalysisCategory, factorKey: string): EtfAnalysisFactorDefinition | undefined {
  const config = CATEGORY_CONFIGS[categoryKey];
  const found = config.factors.find((f) => f.factorKey === factorKey);
  return found ? normalizeGroupFactor(found) : undefined;
}

function prepareFactorAnalysisArray(factors: EtfAnalysisFactorDefinition[]) {
  return factors.map((f) => ({
    factorAnalysisKey: f.factorAnalysisKey,
    factorAnalysisTitle: f.factorAnalysisTitle,
    factorAnalysisDescription: f.factorAnalysisDescription,
    factorAnalysisMetrics: f.factorAnalysisMetrics || '',
    factorAnalysisGroupInstructions: f.factorAnalysisGroupInstructions || '',
  }));
}

const PORTFOLIO_HOLDINGS_TOP_N = 10;

// Summary fields on EtfMorPortfolioInfo.holdings.summary that belong to other reports
// (turnover → Cost & Team; women director / executive percentages → ESG, not forward outlook)
// and should be stripped before passing the bundle to the future-outlook prompt.
const OUTLOOK_PORTFOLIO_SUMMARY_DROPPED_KEYS = new Set(['reportedTurnoverPct', 'turnoverAsOfDate', 'womenDirectorsPct', 'womenExecutivesPct']);

/**
 * Trim `morPortfolioInfo` for the future-performance-outlook prompt: cap the holdings
 * list at the top 10 by weight AND strip ESG + turnover fields from the holdings
 * summary block. Asset allocation, style measures, fixed-income style, sector exposure,
 * and bond breakdown are kept intact.
 */
function trimPortfolioForOutlook(portfolio: EtfWithAllData['morPortfolioInfo']): EtfWithAllData['morPortfolioInfo'] {
  if (!portfolio) return portfolio;

  const holdingsJson = portfolio.holdings as { summary?: Record<string, unknown> | null; columns?: unknown; holdings?: unknown[] } | null;
  if (!holdingsJson) return portfolio;

  const trimmedSummary = holdingsJson.summary
    ? Object.fromEntries(Object.entries(holdingsJson.summary).filter(([k]) => !OUTLOOK_PORTFOLIO_SUMMARY_DROPPED_KEYS.has(k)))
    : holdingsJson.summary;

  const trimmedHoldings = Array.isArray(holdingsJson.holdings) ? holdingsJson.holdings.slice(0, PORTFOLIO_HOLDINGS_TOP_N) : holdingsJson.holdings;

  return {
    ...portfolio,
    holdings: {
      ...holdingsJson,
      summary: trimmedSummary,
      holdings: trimmedHoldings,
    } as typeof portfolio.holdings,
  };
}

// Risk periods we surface to the future-outlook prompt. The 10-Yr window belongs to
// the Risk Analysis report and is not referenced by any outlook factor.
const OUTLOOK_RISK_PERIOD_KEYS: ReadonlyArray<'3-Yr' | '5-Yr'> = ['3-Yr', '5-Yr'];

function pickOutlookRiskPeriods(riskPeriods: unknown): Record<string, unknown> | null {
  if (!riskPeriods || typeof riskPeriods !== 'object') return null;
  const source = riskPeriods as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const key of OUTLOOK_RISK_PERIOD_KEYS) {
    if (source[key] != null) picked[key] = source[key];
  }
  return Object.keys(picked).length > 0 ? picked : null;
}

export function preparePerformanceAndReturnsInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const mor = etf.morAnalyzerInfo;
  const fin = etf.financialInfo;
  const people = etf.morPeopleInfo;
  const assetClass = sa?.assetClass || 'Equity';
  const fundCategory = sa?.category || null;
  const groupKey = getEtfGroupKeyForCategory(fundCategory) || DEFAULT_GROUP_KEY;
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.PerformanceAndReturns, { fundCategory: fundCategory ?? undefined });

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.PerformanceAndReturns,
    assetClass,
    fundCategory,
    groupKey,
    groupName: getGroupNameForGroupKey(groupKey),
    groupCategories: getCategoriesForGroupKey(groupKey).join(', '),
    categoryInstructions: getCategoryInstructions(fundCategory) ?? null,
    indexName: sa?.indexName ?? null,
    factorAnalysisArray: prepareFactorAnalysisArray(factors),
    stockAnalyzerReturns: JSON.stringify({
      return1m: sa?.return1m,
      return3m: sa?.return3m,
      return6m: sa?.return6m,
      returnYtd: sa?.returnYtd,
      return1y: sa?.return1y,
      return3y: sa?.return3y,
      return5y: sa?.return5y,
      return10y: sa?.return10y,
      return15y: sa?.return15y,
      return20y: sa?.return20y,
      cagr1y: sa?.cagr1y,
      cagr3y: sa?.cagr3y,
      cagr5y: sa?.cagr5y,
      cagr10y: sa?.cagr10y,
      cagr15y: sa?.cagr15y,
      cagr20y: sa?.cagr20y,
      change1m: sa?.change1m,
      change3m: sa?.change3m,
      change6m: sa?.change6m,
      changeYtd: sa?.changeYtd,
      change1y: sa?.change1y,
      change3y: sa?.change3y,
      change5y: sa?.change5y,
      change10y: sa?.change10y,
    }),
    stockAnalyzerTechnicals: JSON.stringify({
      stockPrice: sa?.stockPrice,
      change1d: sa?.percentChange,
      ma20: sa?.ma20,
      ma50: sa?.ma50,
      ma150: sa?.ma150,
      ma200: sa?.ma200,
      ma20ChgPercent: sa?.ma20ChgPercent,
      ma50ChgPercent: sa?.ma50ChgPercent,
      ma150ChgPercent: sa?.ma150ChgPercent,
      ma200ChgPercent: sa?.ma200ChgPercent,
      rsi: sa?.rsi,
      rsiW: sa?.rsiW,
      rsiM: sa?.rsiM,
      ath: sa?.ath,
      athDate: sa?.athDate,
      athChgPercent: sa?.athChgPercent,
      atl: sa?.atl,
      atlDate: sa?.atlDate,
      atlChgPercent: sa?.atlChgPercent,
      high52wChg: sa?.high52wChg,
      high52wDate: sa?.high52wDate,
      low52wChg: sa?.low52wChg,
      low52wDate: sa?.low52wDate,
    }),
    morReturns: JSON.stringify({
      returnsAnnual: mor?.returnsAnnual,
      returnsTrailing: mor?.returnsTrailing,
    }),
    morOverview: JSON.stringify({
      overviewCategory: mor?.overviewCategory,
      overviewStyleBox: mor?.overviewStyleBox,
      overviewNav: mor?.overviewNav,
      overviewOneDayReturn: mor?.overviewOneDayReturn,
      overviewTotalAssets: mor?.overviewTotalAssets,
      strategyText: mor?.strategyText,
      indexName: sa?.indexName,
    }),
    financialSummary: JSON.stringify({
      aum: fin?.aum,
      beta: fin?.beta,
      yearHigh: fin?.yearHigh,
      yearLow: fin?.yearLow,
      volume: fin?.volume,
      holdings: fin?.holdings,
    }),
    yieldAndIncome: JSON.stringify({
      dividendYield: fin?.dividendYield,
      overviewSecYield: mor?.overviewSecYield,
      overviewTtmYield: mor?.overviewTtmYield,
      payoutFrequency: fin?.payoutFrequency,
      dividendTtm: fin?.dividendTtm,
      divGrowth3y: sa?.divGrowth3y,
      divGrowth5y: sa?.divGrowth5y,
      divYears: sa?.divYears,
      divGrYears: sa?.divGrYears,
    }),
    fundContext: JSON.stringify({
      expenseRatio: fin?.expenseRatio,
      inceptionDate: people?.inceptionDate,
      overviewStyleBox: mor?.overviewStyleBox,
    }),
    // Corroborating size + trading-friction signals used by the `aum_size` factor.
    // Headline `aum` stays in `financialSummary`; this bundle adds the
    // dollar-volume / spread / total-assets / sharesOut signals so the LLM can grade
    // whether scale is translating into retail-usable liquidity.
    marketScaleAndTradability: JSON.stringify({
      overviewTotalAssets: mor?.overviewTotalAssets,
      sharesOut: fin?.sharesOut,
      marketBidAskSpread: mor?.marketBidAskSpread,
      marketVolumeAvg: mor?.marketVolumeAvg,
      avgVolume: sa?.avgVolume ? sa.avgVolume.toString() : null,
      dollarVol: sa?.dollarVol ? sa.dollarVol.toString() : null,
    }),
  };
}

export function prepareCostEfficiencyAndTeamInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const mor = etf.morAnalyzerInfo;
  const fin = etf.financialInfo;
  const people = etf.morPeopleInfo;
  const portfolio = etf.morPortfolioInfo;
  const assetClass = sa?.assetClass || 'Equity';
  const fundCategory = sa?.category || null;
  const groupKey = getEtfGroupKeyForCategory(fundCategory) || DEFAULT_GROUP_KEY;
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.CostEfficiencyAndTeam, { fundCategory: fundCategory ?? undefined });

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.CostEfficiencyAndTeam,
    assetClass,
    fundCategory,
    groupKey,
    groupName: getGroupNameForGroupKey(groupKey),
    groupCategories: getCategoriesForGroupKey(groupKey).join(', '),
    categoryInstructions: getCategoryInstructions(fundCategory) ?? null,
    indexName: sa?.indexName ?? null,
    factorAnalysisArray: prepareFactorAnalysisArray(factors),
    financialInfo: JSON.stringify({
      expenseRatio: fin?.expenseRatio,
      aum: fin?.aum,
      volume: fin?.volume,
      sharesOut: fin?.sharesOut,
      holdings: fin?.holdings,
      beta: fin?.beta,
      yearHigh: fin?.yearHigh,
      yearLow: fin?.yearLow,
      pe: fin?.pe,
    }),
    stockAnalyzerFundInfo: JSON.stringify({
      issuer: sa?.issuer,
      assetClass: sa?.assetClass,
      category: sa?.category,
      fundName: sa?.fundName,
      avgVolume: sa?.avgVolume ? sa.avgVolume.toString() : null,
      dollarVol: sa?.dollarVol ? sa.dollarVol.toString() : null,
      relVolume: sa?.relVolume,
    }),
    morAnalysis: JSON.stringify({
      overviewAdjExpenseRatio: mor?.overviewAdjExpenseRatio,
      overviewProspectusNetExpenseRatio: mor?.overviewProspectusNetExpenseRatio,
      overviewTurnover: mor?.overviewTurnover,
      overviewCategory: mor?.overviewCategory,
      marketBidAskSpread: mor?.marketBidAskSpread,
      analysis: mor?.analysis,
      strategyText: mor?.strategyText,
    }),
    managementInfo: JSON.stringify({
      inceptionDate: people?.inceptionDate,
      numberOfManagers: people?.numberOfManagers,
      longestTenure: people?.longestTenure,
      averageTenure: people?.averageTenure,
      advisors: people?.advisors,
      currentManagers: people?.currentManagers,
    }),
    portfolioTurnover: JSON.stringify({
      holdings: portfolio?.holdings,
    }),
  };
}

export function prepareRiskAnalysisInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const mor = etf.morAnalyzerInfo;
  const fin = etf.financialInfo;
  const risk = etf.morRiskInfo;
  const assetClass = sa?.assetClass || 'Equity';
  const fundCategory = sa?.category || null;
  const groupKey = getEtfGroupKeyForCategory(fundCategory) || DEFAULT_GROUP_KEY;
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.RiskAnalysis, { fundCategory: fundCategory ?? undefined });

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.RiskAnalysis,
    assetClass,
    fundCategory,
    groupKey,
    groupName: getGroupNameForGroupKey(groupKey),
    groupCategories: getCategoriesForGroupKey(groupKey).join(', '),
    categoryInstructions: getCategoryInstructions(fundCategory) ?? null,
    indexName: sa?.indexName ?? null,
    factorAnalysisArray: prepareFactorAnalysisArray(factors),
    stockAnalyzerRiskMetrics: JSON.stringify({
      beta: fin?.beta,
      beta1y: sa?.beta1y,
      beta2y: sa?.beta2y,
      beta5y: sa?.beta5y,
      sharpe: sa?.sharpe,
      sortino: sa?.sortino,
      atr: sa?.atr,
      rsi: sa?.rsi,
      rsiW: sa?.rsiW,
      rsiM: sa?.rsiM,
      ath: sa?.ath,
      athDate: sa?.athDate,
      athChgPercent: sa?.athChgPercent,
      atl: sa?.atl,
      atlDate: sa?.atlDate,
      atlChgPercent: sa?.atlChgPercent,
    }),
    morRiskPeriods: JSON.stringify({
      riskPeriods: risk?.riskPeriods,
    }),
    financialRiskContext: JSON.stringify({
      beta: fin?.beta,
      yearHigh: fin?.yearHigh,
      yearLow: fin?.yearLow,
      volume: fin?.volume,
    }),
    categoryContext: JSON.stringify({
      overviewCategory: mor?.overviewCategory,
      overviewStyleBox: mor?.overviewStyleBox,
      overviewTotalAssets: mor?.overviewTotalAssets,
    }),
    // Snapshot fields used by `stress_liquidity_and_exit_friction`. Stress-window premium /
    // discount and NAV history are obtained via the prompt's light web-lookup pattern.
    marketLiquidityAndPremiumDiscount: JSON.stringify({
      marketBidAskSpread: mor?.marketBidAskSpread,
      marketVolumeAvg: mor?.marketVolumeAvg,
      marketDiscount: mor?.marketDiscount,
      marketPremium: mor?.marketPremium,
      avgVolume: sa?.avgVolume ? sa.avgVolume.toString() : null,
      dollarVol: sa?.dollarVol ? sa.dollarVol.toString() : null,
    }),
  };
}

export function prepareFuturePerformanceOutlookInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const mor = etf.morAnalyzerInfo;
  const fin = etf.financialInfo;
  const risk = etf.morRiskInfo;
  const portfolio = trimPortfolioForOutlook(etf.morPortfolioInfo);

  const assetClass = sa?.assetClass || 'Equity';
  const fundCategory = sa?.category || null;
  const groupKey = getEtfGroupKeyForCategory(fundCategory) || DEFAULT_GROUP_KEY;
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.FuturePerformanceOutlook, { fundCategory: fundCategory ?? undefined });

  // EtfFinancialInfo — keep forward-relevant fields plus the payout fields the
  // forward_income_durability factor reads (payoutFrequency, payoutRatio). The pure
  // cost / intraday columns (expenseRatio, sharesOut, volume, yearHigh, yearLow) and
  // headline TTM-dollar dividend (dividendTtm) stay excluded — those are Cost & Team
  // territory or covered by StockAnalyzer.
  const financialBundle = fin
    ? {
        aum: fin.aum,
        pe: fin.pe,
        dividendYield: fin.dividendYield,
        payoutFrequency: fin.payoutFrequency,
        payoutRatio: fin.payoutRatio,
        beta: fin.beta,
        holdings: fin.holdings,
      }
    : null;

  // EtfMorAnalyzerInfo — narrow slice. The Mor `analysis` block (sections / medalistRating
  // / headline) is intentionally omitted: the upstream scrape does not consistently
  // populate it, and including it in the schema trains the LLM to expect data that
  // typically won't be there. Market data + cost-related overview fields are also dropped.
  const morAnalyzerBundle = mor
    ? {
        strategyText: mor.strategyText,
        overviewCategory: mor.overviewCategory,
        overviewStyleBox: mor.overviewStyleBox,
        overviewSecYield: mor.overviewSecYield,
        overviewTtmYield: mor.overviewTtmYield,
        returnsAnnual: mor.returnsAnnual,
        returnsTrailing: mor.returnsTrailing,
      }
    : null;

  // EtfMorRiskInfo — keep only 3-Yr + 5-Yr periods. 10-Yr is Risk Analysis territory.
  const riskPeriodsBundle = pickOutlookRiskPeriods(risk?.riskPeriods);
  const morRiskBundle = riskPeriodsBundle ? { riskPeriods: riskPeriodsBundle } : null;

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.FuturePerformanceOutlook,
    assetClass,
    fundCategory,
    groupKey,
    groupName: getGroupNameForGroupKey(groupKey),
    groupCategories: getCategoriesForGroupKey(groupKey).join(', '),
    categoryInstructions: getCategoryInstructions(fundCategory) ?? null,
    indexName: sa?.indexName ?? null,
    factorAnalysisArray: prepareFactorAnalysisArray(factors),

    etfFinancialInfo: financialBundle ? JSON.stringify(financialBundle) : null,
    // Full EtfStockAnalyzerInfo row passes through — slicing it loses too many useful
    // signals for the forward read (full multi-period returns + CAGRs, complete MA stack,
    // RSI daily/weekly/monthly, ATH/ATL + 52w distances, beta windows, risk-adjusted
    // ratios, liquidity, dividend growth, leverage/options/region flags). Routed through
    // serializeBigIntFields so BigInt columns (avgVolume, dollarVol, preVolume) don't
    // break JSON.stringify.
    etfStockAnalyzerInfo: sa ? JSON.stringify(serializeBigIntFields(sa)) : null,
    etfMorAnalyzerInfo: morAnalyzerBundle ? JSON.stringify(serializeBigIntFields(morAnalyzerBundle)) : null,
    etfMorRiskInfo: morRiskBundle ? JSON.stringify(serializeBigIntFields(morRiskBundle)) : null,
    etfMorPortfolioInfo: portfolio ? JSON.stringify(serializeBigIntFields(portfolio)) : null,
  };
}

export function prepareIndexStrategyInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  return {
    name: etf.name,
    exchange: etf.exchange,
    assetClass: sa?.assetClass || null,
    issuer: sa?.issuer || null,
    category: sa?.category || null,
    indexName: sa?.indexName || null,
  };
}

/**
 * Build the Competition-analysis LLM input. Intentionally minimal — per the prompt
 * contract, no financial data is passed; the LLM is expected to source peer facts
 * from reputable public sources given just ETF identity and taxonomy context.
 */
export function prepareEtfCompetitionInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const fundCategory = sa?.category || null;
  const groupKey = getEtfGroupKeyForCategory(fundCategory) || DEFAULT_GROUP_KEY;
  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    assetClass: sa?.assetClass || null,
    category: fundCategory,
    groupKey,
    indexName: sa?.indexName || null,
    issuer: sa?.issuer || null,
  };
}

export function prepareEtfFinalSummaryInputJson(etf: EtfWithAllData) {
  const categorySummaries = (etf.categoryAnalysisResults || []).map((c) => ({
    categoryKey: c.categoryKey,
    overallSummary: c.summary,
  }));

  const factorResults = (etf.analysisCategoryFactorResults || []).map((f) => ({
    categoryKey: f.categoryKey,
    factorAnalysisKey: f.factorKey,
    oneLineExplanation: f.oneLineExplanation,
    result: f.result,
  }));

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    inception: etf.inception || '',
    categorySummaries,
    factorResults,
  };
}
