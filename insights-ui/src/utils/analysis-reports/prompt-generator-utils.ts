import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { ReportType, TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry } from '@/types/ticker-typesv1';
import {
  fetchAnalysisFactors,
  fetchBusinessMoatAnalysisData,
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
import {
  ensureStockAnalyzerDataIsFresh,
  extractFinancialDataForAnalysis,
  extractFinancialDataForPastPerformance,
  extractKpisDataForAnalysis,
} from '@/utils/stock-analyzer-scraper-utils';
import { compileTemplate, loadSchema, validateData } from '@/util/get-llm-response';
import path from 'path';
import { AnalysisCategoryFactor } from '@prisma/client';

// JSON schema to append to factor-based analysis prompts
const FACTOR_ANALYSIS_JSON_SCHEMA = `

return output in json
output schema:
type: object
additionalProperties: false
properties:
  overallSummary:
    type: string
    description: '3–5 sentence final summary of how the stock performs in this category. Must highlight the most important strengths and weaknesses, and conclude with a clear investor takeaway (positive, negative, or mixed). Keep language simple and concise for retail investors.'
  overallAnalysisDetails:
    type: string
    description: 'In 3-4 Paragraphs discuss in detail about the category being discusses. Explain the most important things that are needed to understand that particular stock for that category. More details are shared in the prompt'
  factors:
    type: array
    description: 'Array of factor-level analyses.'
    items:
      type: object
      properties:
        factorAnalysisKey:
          type: string
          description: 'Must match the key from the input factorAnalysisArray.'
        oneLineExplanation:
          type: string
          description: '1–2 sentence quick takeaway that gives the key insight from this factor'
        detailedExplanation:
          type: string
          description: '1–2 paragraphs of investor-focused analysis for this factor. Directly analyze the company's performance based on this factor using available data and reasoning. The explanation must clearly justify the Pass/Fail result, be critical in tone, and highlight risks or weaknesses along with strengths.'
        result:
          type: string
          enum: ['Pass', 'Fail']
          description: 'The final judgment for this factor. Be conservative — only companies with strong fundamentals should get "Pass". A "Fail" should come with clear reasoning in the detailedExplanation.'
      required:
        - factorAnalysisKey
        - oneLineExplanation
        - detailedExplanation
        - result
required:
  - overallSummary
  - overallAnalysisDetails
  - factors
`;

// JSON schema to append to final summary prompt
const FINAL_SUMMARY_JSON_SCHEMA = `

return output in json
output schema:
type: object
additionalProperties: false
properties:
  finalSummary:
    type: string
    description: >-
      The final stock summary text. It must be 6–7 short lines, each line a clear
      sentence. The first line should give the overall verdict (Positive, Negative,
      or Mixed). The following lines should briefly justify the verdict using the
      provided categorySummaries and supporting factor one-line explanations. The
      style should be clear, concise, and suitable for retail investors.
  metaDescription:
    type: string
    description: >-
      A concise meta description for SEO purposes, summarizing the key points about
      the stock in 1-2 sentences. Should be under 160 characters and highlight the
      overall verdict and main factors.
  aboutReport:
    type: string
    description: >-
      A 2-3 sentence summary for the stock analysis report. Should be compelling,
      SEO-friendly, and provide a unique introduction for investors.
required:
  - finalSummary
  - metaDescription
  - aboutReport
`;

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
      const scraperInfoBusiness = await ensureStockAnalyzerDataIsFresh(tickerRecord);
      const analysisFactorsBusiness = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.BusinessAndMoat);
      const kpisDataBusiness = extractKpisDataForAnalysis(scraperInfoBusiness);
      inputJson = prepareBusinessAndMoatInputJson(tickerRecord, analysisFactorsBusiness, competitionAnalysisArray, kpisDataBusiness);
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
      const scraperInfoGrowth = await ensureStockAnalyzerDataIsFresh(tickerRecord);
      const analysisFactorsGrowth = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FutureGrowth);
      const businessMoatData = await fetchBusinessMoatAnalysisData(spaceId, tickerRecord.id);
      const kpisDataGrowth = extractKpisDataForAnalysis(scraperInfoGrowth);
      inputJson = prepareFutureGrowthInputJson(tickerRecord, analysisFactorsGrowth, businessMoatData, kpisDataGrowth);
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
  let finalPrompt = compileTemplate(templateContent, inputJson || {});

  // Append JSON schema instructions based on report type
  if (
    reportType === ReportType.FINANCIAL_ANALYSIS ||
    reportType === ReportType.BUSINESS_AND_MOAT ||
    reportType === ReportType.PAST_PERFORMANCE ||
    reportType === ReportType.FUTURE_GROWTH ||
    reportType === ReportType.FAIR_VALUE
  ) {
    finalPrompt += FACTOR_ANALYSIS_JSON_SCHEMA;
  } else if (reportType === ReportType.FINAL_SUMMARY) {
    finalPrompt += FINAL_SUMMARY_JSON_SCHEMA;
  }

  return {
    prompt: finalPrompt,
    inputJson,
    reportType,
  };
}
