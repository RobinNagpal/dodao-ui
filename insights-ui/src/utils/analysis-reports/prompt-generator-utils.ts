import { readFile } from 'node:fs/promises';
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

// YAML schema file paths relative to process.cwd()
const SCHEMA_PATHS: Partial<Record<ReportType, string>> = {
  [ReportType.FINANCIAL_ANALYSIS]: 'schemas/analysis-factors/outputs/whole-category-analysis-output.schema.yaml',
  [ReportType.BUSINESS_AND_MOAT]: 'schemas/analysis-factors/outputs/whole-category-analysis-output.schema.yaml',
  [ReportType.PAST_PERFORMANCE]: 'schemas/analysis-factors/outputs/whole-category-analysis-output.schema.yaml',
  [ReportType.FUTURE_GROWTH]: 'schemas/analysis-factors/outputs/whole-category-analysis-output.schema.yaml',
  [ReportType.FAIR_VALUE]: 'schemas/analysis-factors/outputs/whole-category-analysis-output.schema.yaml',
  [ReportType.COMPETITION]: 'schemas/analysis-factors/competition/competition-output.schema.yaml',
  [ReportType.MANAGEMENT_TEAM]: 'schemas/analysis-factors/management-team/management-team-output.schema.yaml',
  [ReportType.FINAL_SUMMARY]: 'schemas/analysis-factors/final-summary/final-summary-analysis-output.schema.yaml',
};

/**
 * Reads an output schema YAML file and formats it as the schema block appended to prompts.
 * Strips the $schema metadata line so only the actual schema definition is included.
 */
async function loadOutputSchemaAsPromptText(schemaFilePath: string): Promise<string> {
  const raw = await readFile(schemaFilePath, 'utf-8');
  const withoutMetadata = raw.replace(/^\$schema:[^\n]*\n?/, '');
  return `\nreturn output in json\noutput schema:\n${withoutMetadata}`;
}

/**
 * Builds a "Saving the Result" block that tells an LLM agent exactly how to
 * persist its JSON output via the save-json-report endpoint.
 *
 * The block embeds the real exchange, ticker, spaceId, and reportType values
 * so the agent can construct the API call without any guesswork.
 */
function buildSaveInstructions(symbol: string, exchange: string, reportType: ReportType, spaceId: string): string {
  return `

---
## Saving the Result

Once you have produced the JSON object matching the output schema above, save it by
making the following HTTP request:

POST /api/${spaceId}/tickers-v1/exchange/${encodeURIComponent(exchange)}/${encodeURIComponent(symbol)}/save-json-report

Request body (Content-Type: application/json):
{
  "reportType": "${reportType}",
  "llmResponse": <your complete JSON output>
}

How the fields map:
- "reportType"   → always "${reportType}" for this prompt (identifies which report is being saved)
- "llmResponse"  → the complete JSON object you generated, matching the output schema above

The server will validate "llmResponse" against the output schema before persisting it.
Do not modify the structure — send the exact JSON object your analysis produced.
---
`;
}

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

    case ReportType.MANAGEMENT_TEAM:
      inputJson = prepareBaseTickerInputJson(tickerRecord);
      promptKey = 'US/public-equities-v1/management-team';
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

  // Load output schema from the canonical YAML file and append to prompt
  const relativeSchemaPath = SCHEMA_PATHS[reportType];
  const schema = relativeSchemaPath ? await loadOutputSchemaAsPromptText(path.join(process.cwd(), relativeSchemaPath)) : '';

  // Build save instructions so the agent knows how to persist the result
  const saveInstructions = buildSaveInstructions(symbol, exchange, reportType, spaceId);

  // Prepend internet instruction; append output schema then save instructions
  finalPrompt = INTERNET_INSTRUCTION + finalPrompt + schema + saveInstructions;

  return {
    prompt: finalPrompt,
    inputJson,
    reportType,
    schema,
  };
}
