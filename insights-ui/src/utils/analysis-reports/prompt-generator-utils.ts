import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysisArray } from '@/types/public-equity/analysis-factors-types';
import { ReportType, TickerAnalysisCategory, TickerV1WithIndustryAndSubIndustry } from '@/types/ticker-typesv1';
import {
  fetchAnalysisFactors,
  fetchBusinessMoatAnalysisData,
  fetchTickerRecordBySymbolAndExchangeWithAnalysisData,
  fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry,
} from '@/utils/analysis-reports/get-report-data-utils';
import {
  ensureStockAnalyzerDataIsFresh,
  extractFinancialDataForAnalysis,
  extractFinancialDataForPastPerformance,
  extractKpisDataForAnalysis,
  loadFairValueValuationSnapshot,
} from '@/utils/stock-analyzer-scraper-utils';
import {
  prepareBaseTickerInputJson,
  prepareBusinessAndMoatInputJson,
  prepareFairValueInputJson,
  prepareFinalSummaryInputJson,
  prepareFinancialAnalysisInputJson,
  prepareFutureGrowthInputJson,
  preparePastPerformanceInputJson,
} from '@/utils/analysis-reports/report-input-json-utils';
import { compileTemplate, loadSchema, validateData } from '@/util/get-llm-response';
import path from 'path';
import { AnalysisCategoryFactor } from '@prisma/client';

const INTERNET_INSTRUCTION = `Use internet to validate the information and make sure to return the result based on the latest information.

`;

// JSON schema to append to factor-based analysis prompts
const FACTOR_ANALYSIS_JSON_SCHEMA = `

return output in json
output schema:
type: object
additionalProperties: false
properties:
  overallSummary:
    type: string
    description: '3–5 sentence summary of the category analysis. Summarize the key points from overallAnalysisDetails and conclude with a clear investor takeaway (positive, negative, or mixed). Keep language simple and concise for retail investors.'
  overallAnalysisDetails:
    type: string
    description: 'A detailed multi-paragraph analysis (typically 7–9 paragraphs, 1800–2500 words) following the structure and order specified in the prompt. Cover all key sub-topics for this category in the order laid out in the prompt instructions.'
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
          description: '1 sentence giving the key takeaway or insight from this factor.'
        detailedExplanation:
          type: string
          description: '1 paragraph of investor-focused analysis for this factor. Directly analyze the company's performance using available data. Clearly justify the Pass/Fail result, be critical in tone, and highlight risks or weaknesses along with strengths.'
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
      Plain text, two paragraphs of 3–4 lines each. Paragraph 1: describe the
      company's business model and rate its current state (excellent / very good /
      good / fair / bad / very bad) with a brief supporting reason. Paragraph 2:
      how the company compares with its competition and a conservative, actionable
      investor takeaway sentence (e.g. "Suitable for long-term investors seeking
      growth" or "High risk — best to avoid until profitability improves").
  metaDescription:
    type: string
    description: >-
      A concise SEO meta description (maximum 160 characters, no introductory
      text) that is compelling and informative for search engines. Include key
      information about the company and its overall analysis conclusion.
  aboutReport:
    type: string
    description: >-
      A unique 2–3 sentence introduction for the stock analysis report, rewritten
      from the base stock information with varied structure and vocabulary to avoid
      duplicate content penalties. Tone must be professional, insightful, and
      authoritative.
required:
  - finalSummary
  - metaDescription
  - aboutReport
`;

// JSON schema to append to competition prompts
const COMPETITION_JSON_SCHEMA = `

return output in json
output schema:
type: object
additionalProperties: false
properties:
  summary:
    type: string
    description: '3–5 sentences summarizing the target company's position relative to its peers. Highlight whether it is stronger, weaker, or mixed vs. competitors. End with a clear investor takeaway.'
  overallAnalysisDetails:
    type: string
    description: '3–4 paragraphs with a high-level overview of how the company compares to its competition. Must not repeat information or data points already covered in the competitionAnalysisArray entries.'
  competitionAnalysisArray:
    type: array
    description: 'Array of competitor comparisons — 6 to 8 competitors including public, private, and international peers.'
    items:
      type: object
      properties:
        companyName:
          type: string
          description: 'Full name of the competitor company.'
        companySymbol:
          type: string
          description: 'Ticker symbol of the competitor company (if available).'
        exchangeSymbol:
          type: string
          description: 'Exchange symbol (e.g., NASDAQ, NYSE, TSX) of the competitor (if available).'
        exchangeName:
          type: string
          description: 'Readable exchange name (if available).'
        detailedComparison:
          type: string
          description: 'Exactly 7 paragraphs: (1) overall comparison summary, (2) Business & Moat head-to-head with winner named, (3) Financial Statement Analysis head-to-head with winner named, (4) Past Performance head-to-head with winner named, (5) Future Growth head-to-head with winner named, (6) Fair Value head-to-head with winner named, (7) overall winner declaration with evidence-based reasoning.'
      required:
        - companyName
        - detailedComparison
required:
  - summary
  - overallAnalysisDetails
  - competitionAnalysisArray
`;

// JSON schema to append to future-risk prompts
const FUTURE_RISK_JSON_SCHEMA = `

return output in json
output schema:
type: object
additionalProperties: false
properties:
  summary:
    type: string
    description: '3–4 sentences highlighting the top risks facing the company. Must conclude with a direct investor takeaway (e.g., "Investors should watch for X and Y risks over the next few years").'
  detailedAnalysis:
    type: string
    description: '3–4 forward-looking paragraphs (focused on 2025 and beyond) identifying the top 3–5 risks. Cover: macro risks (interest rates, inflation, economic cycles), industry risks (competition, technological disruption, regulation), and company-specific risks (debt, concentration, management decisions, etc.).'
required:
  - summary
  - detailedAnalysis
`;

export interface GeneratedPromptResult {
  prompt: string;
  inputJson: any;
  reportType: ReportType;
  schema: string;
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
      inputJson = prepareBusinessAndMoatInputJson(tickerRecord, analysisFactorsBusiness, kpisDataBusiness);
      promptKey = 'US/public-equities-v1/business-moat';
      break;

    case ReportType.PAST_PERFORMANCE:
      const scraperInfoPast = await ensureStockAnalyzerDataIsFresh(tickerRecord);
      const financialDataPast = extractFinancialDataForPastPerformance(scraperInfoPast);
      const analysisFactorsPast = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.PastPerformance);
      inputJson = preparePastPerformanceInputJson(tickerRecord, analysisFactorsPast, financialDataPast);
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
      const valuationSnapshotFair = await loadFairValueValuationSnapshot(tickerRecord);
      const analysisFactorsFair: AnalysisCategoryFactor[] = await fetchAnalysisFactors(tickerRecord, TickerAnalysisCategory.FairValue);
      inputJson = prepareFairValueInputJson(tickerV1WithAnalysis, analysisFactorsFair, valuationSnapshotFair);
      promptKey = 'US/public-equities-v1/fair-value';
      break;

    case ReportType.FUTURE_RISK:
      inputJson = prepareBaseTickerInputJson(tickerRecord);
      promptKey = 'US/public-equities-v1/future-risk';
      break;

    case ReportType.FINAL_SUMMARY:
      const tickerWithAnalysis = await fetchTickerRecordBySymbolAndExchangeWithAnalysisData(symbol, exchange);
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

  // Map each report type to its output JSON schema
  const schemaByReportType: Partial<Record<ReportType, string>> = {
    [ReportType.FINANCIAL_ANALYSIS]: FACTOR_ANALYSIS_JSON_SCHEMA,
    [ReportType.BUSINESS_AND_MOAT]: FACTOR_ANALYSIS_JSON_SCHEMA,
    [ReportType.PAST_PERFORMANCE]: FACTOR_ANALYSIS_JSON_SCHEMA,
    [ReportType.FUTURE_GROWTH]: FACTOR_ANALYSIS_JSON_SCHEMA,
    [ReportType.FAIR_VALUE]: FACTOR_ANALYSIS_JSON_SCHEMA,
    [ReportType.COMPETITION]: COMPETITION_JSON_SCHEMA,
    [ReportType.FUTURE_RISK]: FUTURE_RISK_JSON_SCHEMA,
    [ReportType.FINAL_SUMMARY]: FINAL_SUMMARY_JSON_SCHEMA,
  };

  const schema = schemaByReportType[reportType] ?? '';

  // Prepend internet instruction and append output schema to every prompt
  finalPrompt = INTERNET_INSTRUCTION + finalPrompt + schema;

  return {
    prompt: finalPrompt,
    inputJson,
    reportType,
    schema,
  };
}
