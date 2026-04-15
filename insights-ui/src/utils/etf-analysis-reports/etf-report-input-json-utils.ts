import { EtfAnalysisCategory, EtfAnalysisFactorDefinition, EtfAnalysisFactorsConfig } from '@/types/etf/etf-analysis-types';
import etfAnalysisFactorsConfig from '@/etf-analysis-data/etf-analysis-factors.json';
import { EtfWithAllData } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';

function isEtfAnalysisCategory(value: string): value is EtfAnalysisCategory {
  return (Object.values(EtfAnalysisCategory) as string[]).includes(value);
}

function parseEtfAnalysisFactorsConfig(raw: typeof etfAnalysisFactorsConfig): EtfAnalysisFactorsConfig {
  return {
    categories: raw.categories.map((c) => {
      if (!isEtfAnalysisCategory(c.categoryKey)) {
        throw new Error(`Invalid ETF analysis categoryKey in config: ${c.categoryKey}`);
      }
      return {
        ...c,
        categoryKey: c.categoryKey,
      };
    }),
  };
}

const typedConfig = parseEtfAnalysisFactorsConfig(etfAnalysisFactorsConfig);

export function getEtfAnalysisFactorsForCategory(categoryKey: EtfAnalysisCategory): EtfAnalysisFactorDefinition[] {
  const category = typedConfig.categories.find((c) => c.categoryKey === categoryKey);
  if (!category) {
    throw new Error(`ETF analysis category not found: ${categoryKey}`);
  }
  return category.factors;
}

function prepareFactorAnalysisArray(factors: EtfAnalysisFactorDefinition[]) {
  return factors.map((f) => ({
    factorAnalysisKey: f.factorAnalysisKey,
    factorAnalysisTitle: f.factorAnalysisTitle,
    factorAnalysisDescription: f.factorAnalysisDescription,
    factorAnalysisMetrics: f.factorAnalysisMetrics || '',
  }));
}

export function preparePerformanceAndReturnsInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const mor = etf.morAnalyzerInfo;
  const fin = etf.financialInfo;
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.PerformanceAndReturns);

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.PerformanceAndReturns,
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
      percentChange: sa?.percentChange,
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
  };
}

export function prepareCostEfficiencyAndTeamInputJson(etf: EtfWithAllData) {
  const sa = etf.stockAnalyzerInfo;
  const mor = etf.morAnalyzerInfo;
  const fin = etf.financialInfo;
  const people = etf.morPeopleInfo;
  const portfolio = etf.morPortfolioInfo;
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.CostEfficiencyAndTeam);

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.CostEfficiencyAndTeam,
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
  const factors = getEtfAnalysisFactorsForCategory(EtfAnalysisCategory.RiskAnalysis);

  return {
    name: etf.name,
    symbol: etf.symbol,
    exchange: etf.exchange,
    categoryKey: EtfAnalysisCategory.RiskAnalysis,
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
