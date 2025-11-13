import { AnalysisCategoryFactor, TickerV1 } from '@prisma/client';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry, VERDICT_DEFINITIONS } from '@/types/ticker-typesv1';
import { buildBaseAboutReport } from '@/utils/analysis-reports/save-report-utils';

/**
 * Base input JSON for ticker analysis
 */
export interface BaseTickerInputJson {
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  industryName: string;
  industryDescription: string;
  subIndustryKey: string;
  subIndustryName: string;
  subIndustryDescription: string;
}

/**
 * Factor analysis input JSON
 */
export interface FactorAnalysisInputJson extends BaseTickerInputJson {
  categoryKey: TickerAnalysisCategory;
  factorAnalysisArray: Array<{
    factorAnalysisKey: string;
    factorAnalysisTitle: string;
    factorAnalysisDescription: string;
    factorAnalysisMetrics: string;
  }>;
  competitionAnalysisArray?: CompetitionAnalysisArray;
}

/**
 * Financial data input JSON
 */
export interface FinancialDataInputJson {
  marketSummary: string;
  incomeStatement: string;
  balanceSheet: string;
  cashFlow: string;
  ratios: string;
  dividends: string;
}

/**
 * Investor analysis input JSON
 */
export interface InvestorAnalysisInputJson extends BaseTickerInputJson {
  investorKey: string;
  verdicts: Array<{
    key: string;
    label: string;
    one_liner: string;
    signal_checks: string[];
    score: number;
  }>;
  competitionAnalysisArray: CompetitionAnalysisArray;
}

/**
 * Final summary input JSON
 */
export interface FinalSummaryInputJson extends BaseTickerInputJson {
  exchange: string;
  categorySummaries: Array<{
    categoryKey: string;
    overallSummary: string;
  }>;
  factorResults: Array<{
    categoryKey: string;
    factorAnalysisKey: string;
    oneLineExplanation: string;
    result: string;
  }>;
  baseInfo: string;
}

/**
 * Prepares the base input JSON for ticker analysis
 */
export function prepareBaseTickerInputJson(tickerRecord: TickerV1WithIndustryAndSubIndustry): BaseTickerInputJson {
  return {
    name: tickerRecord.name,
    symbol: tickerRecord.symbol,
    exchange: tickerRecord.exchange,
    industryKey: tickerRecord.industryKey,
    industryName: tickerRecord.industry.name,
    industryDescription: tickerRecord.industry.summary,
    subIndustryKey: tickerRecord.subIndustryKey,
    subIndustryName: tickerRecord.subIndustry.name,
    subIndustryDescription: tickerRecord.subIndustry.summary,
  };
}

/**
 * Prepares factor analysis array from analysis factors
 */
export function prepareFactorAnalysisArray(analysisFactors: AnalysisCategoryFactor[]): Array<{
  factorAnalysisKey: string;
  factorAnalysisTitle: string;
  factorAnalysisDescription: string;
  factorAnalysisMetrics: string;
}> {
  return analysisFactors.map((factor) => ({
    factorAnalysisKey: factor.factorAnalysisKey,
    factorAnalysisTitle: factor.factorAnalysisTitle,
    factorAnalysisDescription: factor.factorAnalysisDescription,
    factorAnalysisMetrics: factor.factorAnalysisMetrics || '',
  }));
}

/**
 * Prepares input JSON for business and moat analysis
 */
export function prepareBusinessAndMoatInputJson(
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  analysisFactors: AnalysisCategoryFactor[],
  competitionAnalysisArray: CompetitionAnalysisArray
): FactorAnalysisInputJson {
  return {
    ...prepareBaseTickerInputJson(tickerRecord),
    categoryKey: TickerAnalysisCategory.BusinessAndMoat,
    factorAnalysisArray: prepareFactorAnalysisArray(analysisFactors),
    competitionAnalysisArray,
  };
}

/**
 * Prepares input JSON for past performance analysis
 */
export function preparePastPerformanceInputJson(
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  analysisFactors: AnalysisCategoryFactor[],
  competitionAnalysisArray: CompetitionAnalysisArray,
  financialData: {
    marketSummary: any;
    incomeStatement: any;
    balanceSheet: any;
    cashFlow: any;
    ratios: any;
    dividends: any;
  }
): FactorAnalysisInputJson & FinancialDataInputJson {
  return {
    ...prepareBaseTickerInputJson(tickerRecord),
    categoryKey: TickerAnalysisCategory.PastPerformance,
    factorAnalysisArray: prepareFactorAnalysisArray(analysisFactors),
    competitionAnalysisArray,
    marketSummary: JSON.stringify(financialData.marketSummary),
    incomeStatement: JSON.stringify(financialData.incomeStatement),
    balanceSheet: JSON.stringify(financialData.balanceSheet),
    cashFlow: JSON.stringify(financialData.cashFlow),
    ratios: JSON.stringify(financialData.ratios),
    dividends: JSON.stringify(financialData.dividends),
  };
}

/**
 * Prepares input JSON for future growth analysis
 */
export function prepareFutureGrowthInputJson(
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  analysisFactors: AnalysisCategoryFactor[],
  competitionAnalysisArray: CompetitionAnalysisArray
): FactorAnalysisInputJson {
  return {
    ...prepareBaseTickerInputJson(tickerRecord),
    categoryKey: TickerAnalysisCategory.FutureGrowth,
    factorAnalysisArray: prepareFactorAnalysisArray(analysisFactors),
    competitionAnalysisArray,
  };
}

/**
 * Prepares input JSON for financial analysis
 */
export function prepareFinancialAnalysisInputJson(
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  analysisFactors: AnalysisCategoryFactor[],
  financialData: {
    marketSummary: any;
    incomeStatement: any;
    balanceSheet: any;
    cashFlow: any;
    ratios: any;
    dividends: any;
  }
): FactorAnalysisInputJson & FinancialDataInputJson {
  return {
    ...prepareBaseTickerInputJson(tickerRecord),
    categoryKey: TickerAnalysisCategory.FinancialStatementAnalysis,
    factorAnalysisArray: prepareFactorAnalysisArray(analysisFactors),
    marketSummary: JSON.stringify(financialData.marketSummary),
    incomeStatement: JSON.stringify(financialData.incomeStatement),
    balanceSheet: JSON.stringify(financialData.balanceSheet),
    cashFlow: JSON.stringify(financialData.cashFlow),
    ratios: JSON.stringify(financialData.ratios),
    dividends: JSON.stringify(financialData.dividends),
  };
}

/**
 * Prepares input JSON for fair value analysis
 */
export function prepareFairValueInputJson(
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  analysisFactors: AnalysisCategoryFactor[],
  financialData: {
    marketSummary: any;
    incomeStatement: any;
    balanceSheet: any;
    cashFlow: any;
    ratios: any;
    dividends: any;
  }
): FactorAnalysisInputJson & FinancialDataInputJson {
  return {
    ...prepareBaseTickerInputJson(tickerRecord),
    categoryKey: TickerAnalysisCategory.FairValue,
    factorAnalysisArray: prepareFactorAnalysisArray(analysisFactors),
    marketSummary: JSON.stringify(financialData.marketSummary),
    incomeStatement: JSON.stringify(financialData.incomeStatement),
    balanceSheet: JSON.stringify(financialData.balanceSheet),
    cashFlow: JSON.stringify(financialData.cashFlow),
    ratios: JSON.stringify(financialData.ratios),
    dividends: JSON.stringify(financialData.dividends),
  };
}

/**
 * Prepares input JSON for investor analysis
 */
export function prepareInvestorAnalysisInputJson(
  tickerRecord: TickerV1WithIndustryAndSubIndustry,
  investorKey: string,
  competitionAnalysisArray: CompetitionAnalysisArray
): InvestorAnalysisInputJson {
  return {
    ...prepareBaseTickerInputJson(tickerRecord),
    investorKey,
    verdicts: Object.values(VERDICT_DEFINITIONS),
    competitionAnalysisArray,
  };
}

/**
 * Prepares input JSON for final summary
 */
export function prepareFinalSummaryInputJson(
  tickerRecord: TickerV1WithIndustryAndSubIndustry & {
    categoryAnalysisResults: Array<{
      categoryKey: string;
      summary: string;
      factorResults: Array<{
        analysisCategoryFactor: {
          factorAnalysisKey: string;
        };
        oneLineExplanation: string;
        result: string;
      }>;
    }>;
    vsCompetition?: {
      competitionAnalysisArray: CompetitionAnalysisArray;
    } | null;
  }
): FinalSummaryInputJson {
  const baseInputJson = prepareBaseTickerInputJson(tickerRecord);

  const categorySummaries = tickerRecord.categoryAnalysisResults.map((categoryResult) => ({
    categoryKey: categoryResult.categoryKey,
    overallSummary: categoryResult.summary,
  }));

  const factorResults = tickerRecord.categoryAnalysisResults.flatMap((categoryResult) =>
    categoryResult.factorResults.map((factorResult) => ({
      categoryKey: categoryResult.categoryKey,
      factorAnalysisKey: factorResult.analysisCategoryFactor.factorAnalysisKey,
      oneLineExplanation: factorResult.oneLineExplanation,
      result: factorResult.result,
    }))
  );

  // Generate base info using buildBaseAboutReport
  const baseInfo = buildBaseAboutReport(tickerRecord);

  return {
    ...baseInputJson,
    exchange: tickerRecord.exchange,
    categorySummaries,
    factorResults,
    baseInfo,
  };
}
