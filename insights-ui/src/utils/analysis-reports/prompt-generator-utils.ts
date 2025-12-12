import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { ReportType, TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry } from '@/types/ticker-typesv1';
import {
  fetchAnalysisFactors,
  fetchTickerRecordBySymbolAndExchangeWithAnalysisData,
  fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry,
  fetchTickerRecordWithAnalysisData,
} from '@/utils/analysis-reports/get-report-data-utils';
import {
  prepareBaseTickerInputJson,
  prepareBusinessAndMoatInputJson,
  prepareFairValueInputJson,
  prepareFinalSummaryInputJson,
  prepareFinancialAnalysisInputJson,
  prepareFutureGrowthInputJson,
  prepareInvestorAnalysisInputJson,
  preparePastPerformanceInputJson,
} from '@/utils/analysis-reports/report-input-json-utils';
import { ensureStockAnalyzerDataIsFresh, extractFinancialDataForAnalysis, extractFinancialDataForPastPerformance } from '@/utils/stock-analyzer-scraper-utils';
import { compileTemplate, loadSchema, validateData } from '@/util/get-llm-response';
import path from 'path';
import { AnalysisCategoryFactor } from '@prisma/client';

export interface GeneratedPromptResult {
  prompt: string;
  inputJson: any;
  reportType: ReportType;
}

/**
 * Generate prompt for a specific report type without executing it
 */
export async function generatePromptForReportType(symbol: string, exchange: string, reportType: ReportType): Promise<GeneratedPromptResult> {
  const tickerRecord: TickerV1WithIndustryAndSubIndustry = await fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(symbol, exchange);
  const spaceId = KoalaGainsSpaceId;

  let inputJson: any;
  let promptKey: string;

  // Get competition data if needed for dependent reports
  const competitionData = await prisma.tickerV1VsCompetition.findFirst({
    where: {
      spaceId,
      tickerId: tickerRecord.id,
    },
  });
  const competitionAnalysisArray: CompetitionAnalysisArray = competitionData?.competitionAnalysisArray || [];

  // Prepare input JSON based on report type
  switch (reportType) {
    case ReportType.COMPETITION:
      inputJson = prepareBaseTickerInputJson(tickerRecord);
      promptKey = 'US/public-equities-v1/competition';
      break;

    case ReportType.FINANCIAL_ANALYSIS:
      const scraperInfoFinancial = await ensureStockAnalyzerDataIsFresh(tickerRecord);
      const analysisFactorsFinancial = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FinancialStatementAnalysis);
      const financialDataAnalysis = extractFinancialDataForAnalysis(scraperInfoFinancial);
      inputJson = prepareFinancialAnalysisInputJson(tickerRecord, analysisFactorsFinancial, financialDataAnalysis);
      promptKey = 'US/public-equities-v1/financial-statements';
      break;

    case ReportType.BUSINESS_AND_MOAT:
      const analysisFactorsBusiness = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.BusinessAndMoat);
      inputJson = prepareBusinessAndMoatInputJson(tickerRecord, analysisFactorsBusiness, competitionAnalysisArray);
      promptKey = 'US/public-equities-v1/business-moat';
      break;

    case ReportType.PAST_PERFORMANCE:
      const scraperInfoPast = await ensureStockAnalyzerDataIsFresh(tickerRecord);
      const financialDataPast = extractFinancialDataForPastPerformance(scraperInfoPast);
      const analysisFactorsPast = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.PastPerformance);
      inputJson = preparePastPerformanceInputJson(tickerRecord, analysisFactorsPast, competitionAnalysisArray, financialDataPast);
      promptKey = 'US/public-equities-v1/past-performance';
      break;

    case ReportType.FUTURE_GROWTH:
      const analysisFactorsGrowth = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FutureGrowth);
      inputJson = prepareFutureGrowthInputJson(tickerRecord, analysisFactorsGrowth, competitionAnalysisArray);
      promptKey = 'US/public-equities-v1/future-growth';
      break;

    case ReportType.FAIR_VALUE:
      const tickerV1WithAnalysis = await fetchTickerRecordBySymbolAndExchangeWithAnalysisData(symbol, exchange);
      const analysisFactorsFair: AnalysisCategoryFactor[] = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FairValue);
      inputJson = prepareFairValueInputJson(tickerV1WithAnalysis, analysisFactorsFair);
      promptKey = 'US/public-equities-v1/fair-value';
      break;

    case ReportType.FUTURE_RISK:
      inputJson = prepareBaseTickerInputJson(tickerRecord);
      promptKey = 'US/public-equities-v1/future-risk';
      break;

    case ReportType.WARREN_BUFFETT:
    case ReportType.CHARLIE_MUNGER:
    case ReportType.BILL_ACKMAN:
      inputJson = prepareInvestorAnalysisInputJson(tickerRecord, reportType, competitionAnalysisArray);
      promptKey = 'US/public-equities-v1/investor-analysis';
      break;

    case ReportType.FINAL_SUMMARY:
      const tickerWithAnalysis = await fetchTickerRecordWithAnalysisData(tickerRecord.symbol);
      inputJson = prepareFinalSummaryInputJson(tickerWithAnalysis);
      promptKey = 'US/public-equities-v1/final-summary';
      break;

    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  // Fetch prompt from database
  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      key: promptKey,
    },
    include: {
      activePromptVersion: true,
    },
  });

  if (!prompt.activePromptVersion) {
    throw new Error(`Active prompt version not found for template ${promptKey}`);
  }

  // Validate input against schema if provided
  if (prompt.inputSchema && prompt.inputSchema.trim() !== '') {
    const inputSchemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
    const inputSchemaObject = await loadSchema(inputSchemaPath, prompt.inputSchema);
    const { valid, errors } = validateData(inputSchemaObject, inputJson);
    if (!valid) {
      console.error(`Input validation failed: ${JSON.stringify(errors)}`);
      throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
    }
  }

  // Compile template to generate final prompt
  const templateContent = prompt.activePromptVersion.promptTemplate;
  const finalPrompt = compileTemplate(templateContent, inputJson || {});

  return {
    prompt: finalPrompt,
    inputJson,
    reportType,
  };
}
