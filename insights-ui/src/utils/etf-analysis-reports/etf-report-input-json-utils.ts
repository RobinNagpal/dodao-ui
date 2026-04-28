import {
  EtfAnalysisCategory,
  EtfAnalysisFactorDefinition,
  EtfCategoriesConfig,
  EtfGroupBasedFactorsConfig,
  EtfGroupFactorDefinition,
} from '@/types/etf/etf-analysis-types';
import { serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import etfCategoriesRaw from '@/etf-analysis-data/etf-analysis-categories.json';
import performanceAndReturnsRaw from '@/etf-analysis-data/etf-analysis-factors-performance-and-returns.json';
import costEfficiencyAndTeamRaw from '@/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json';
import riskAnalysisRaw from '@/etf-analysis-data/etf-analysis-factors-risk-analysis.json';
import futurePerformanceOutlookRaw from '@/etf-analysis-data/etf-analysis-factors-future-performance-outlook.json';
import { EtfWithAllData } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';

const DEFAULT_GROUP_KEY = 'broad-equity';

const categoriesConfig = etfCategoriesRaw as EtfCategoriesConfig;
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

function normalizeGroupFactor(f: EtfGroupFactorDefinition): EtfAnalysisFactorDefinition {
  return {
    factorAnalysisKey: f.factorKey,
    factorAnalysisTitle: f.factorTitle,
    factorAnalysisDescription: f.factorDescription,
    factorAnalysisMetrics: f.factorMetrics,
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

function getGroupFactors(config: EtfGroupBasedFactorsConfig, groupKey: string): EtfAnalysisFactorDefinition[] {
  return config.factors.filter((f) => f.groups.includes(groupKey)).map(normalizeGroupFactor);
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
  }));
}

const PORTFOLIO_HOLDINGS_TOP_N = 10;

/**
 * Returns a shallow clone of `morPortfolioInfo` with the inner holdings list capped
 * at the top N entries. The raw holdings array for a broad-index ETF can contain
 * hundreds of rows and blow the prompt size past `60KB`, even though only the
 * largest positions drive the analysis. Everything else on the record is kept intact.
 */
function trimPortfolioHoldings(portfolio: EtfWithAllData['morPortfolioInfo']): EtfWithAllData['morPortfolioInfo'] {
  if (!portfolio) return portfolio;

  const holdingsJson = portfolio.holdings as { summary?: unknown; columns?: unknown; holdings?: unknown } | null;
  if (!holdingsJson || !Array.isArray(holdingsJson.holdings) || holdingsJson.holdings.length <= PORTFOLIO_HOLDINGS_TOP_N) {
    return portfolio;
  }

  return {
    ...portfolio,
    holdings: {
      ...holdingsJson,
      holdings: holdingsJson.holdings.slice(0, PORTFOLIO_HOLDINGS_TOP_N),
    } as typeof portfolio.holdings,
  };
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
  };
}

export function prepareFuturePerformanceOutlookInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const mor = etf.morAnalyzerInfo;
  const fin = etf.financialInfo;
  const risk = etf.morRiskInfo;
  const people = etf.morPeopleInfo;
  // The raw holdings list can run to hundreds of rows; trim to the top positions so
  // the resulting prompt stays within a reasonable size budget for downstream LLMs.
  const portfolio = trimPortfolioHoldings(etf.morPortfolioInfo);

  const assetClass = sa?.assetClass || 'Equity';
  const fundCategory = sa?.category || null;
  const groupKey = getEtfGroupKeyForCategory(fundCategory) || DEFAULT_GROUP_KEY;
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.FuturePerformanceOutlook, { fundCategory: fundCategory ?? undefined });

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.FuturePerformanceOutlook,
    assetClass,
    fundCategory,
    groupKey,
    factorAnalysisArray: prepareFactorAnalysisArray(factors),

    // Broad blocks: the forward-looking category is explicitly synthesis-heavy,
    // and upstream data availability varies a lot by ETF type. Route through
    // serializeBigIntFields so BigInt columns (stockAnalyzerInfo.avgVolume,
    // dollarVol, preVolume) don't break JSON.stringify.
    etfFinancialInfo: fin ? JSON.stringify(serializeBigIntFields(fin)) : null,
    etfStockAnalyzerInfo: sa ? JSON.stringify(serializeBigIntFields(sa)) : null,
    etfMorAnalyzerInfo: mor ? JSON.stringify(serializeBigIntFields(mor)) : null,
    etfMorRiskInfo: risk ? JSON.stringify(serializeBigIntFields(risk)) : null,
    etfMorPeopleInfo: people ? JSON.stringify(serializeBigIntFields(people)) : null,
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
