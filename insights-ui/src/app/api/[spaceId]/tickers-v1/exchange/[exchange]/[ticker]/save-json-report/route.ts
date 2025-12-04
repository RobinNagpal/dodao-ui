import { ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { LLMFactorAnalysisResponse } from '@/types/public-equity/analysis-factors-types';
import {
  saveBusinessAndMoatFactorAnalysisResponse,
  saveCompetitionAnalysisResponse,
  saveFairValueFactorAnalysisResponse,
  saveFinalSummaryResponse,
  saveFinancialAnalysisFactorAnalysisResponse,
  saveFutureGrowthFactorAnalysisResponse,
  savePastPerformanceFactorAnalysisResponse,
} from '@/utils/analysis-reports/save-report-utils';
import { fetchAnalysisFactors, fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry } from '@/utils/analysis-reports/get-report-data-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { loadSchema, validateData } from '@/util/get-llm-response';
import path from 'path';
import { FinalSummaryResponse } from '../final-summary/route';
import { CompetitionAnalysisResponse } from '../competition/route';

// Union type for all possible LLM responses
export type LLMResponse =
  | LLMFactorAnalysisResponse // For BUSINESS_AND_MOAT, PAST_PERFORMANCE, FUTURE_GROWTH, FINANCIAL_ANALYSIS, FAIR_VALUE
  | CompetitionAnalysisResponse // For COMPETITION
  | FinalSummaryResponse; // For FINAL_SUMMARY

export interface SaveJsonReportRequest {
  llmResponse: LLMResponse;
  reportType: ReportType;
}

/**
 * Validates that all factor analysis keys in the JSON response exist in the database
 */
async function validateAnalysisFactors(
  ticker: string,
  exchange: string,
  llmResponse: LLMFactorAnalysisResponse,
  category: TickerAnalysisCategory
): Promise<void> {
  const tickerRecord = await fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry(ticker, exchange);
  const analysisFactors = await fetchAnalysisFactors(tickerRecord, category);

  // Get valid factor keys from database
  const validFactorKeys = new Set(analysisFactors.map((factor) => factor.factorAnalysisKey));

  // Check if llmResponse has factors array
  if (!llmResponse.factors || !Array.isArray(llmResponse.factors)) {
    throw new Error(`Invalid response format: 'factors' array is required for ${category}`);
  }

  // Validate each factor key in the response
  const invalidKeys: string[] = [];
  for (const factor of llmResponse.factors) {
    if (!factor.factorAnalysisKey) {
      throw new Error(`Missing 'factorAnalysisKey' in factor: ${JSON.stringify(factor)}`);
    }

    if (!validFactorKeys.has(factor.factorAnalysisKey)) {
      invalidKeys.push(factor.factorAnalysisKey);
    }
  }

  if (invalidKeys.length > 0) {
    throw new Error(
      `Invalid analysis factor keys for ${category}: [${invalidKeys.join(', ')}]. ` + `Valid keys are: [${Array.from(validFactorKeys).join(', ')}]`
    );
  }
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }) {
  const { spaceId, exchange, ticker } = await params;
  const { llmResponse, reportType }: SaveJsonReportRequest = await req.json();

  // Validate JSON against appropriate schema
  let schemaPath: string;
  switch (reportType) {
    case ReportType.BUSINESS_AND_MOAT:
    case ReportType.PAST_PERFORMANCE:
    case ReportType.FUTURE_GROWTH:
    case ReportType.FINANCIAL_ANALYSIS:
    case ReportType.FAIR_VALUE:
      schemaPath = path.join(process.cwd(), 'schemas', 'analysis-factors', 'outputs', 'whole-category-analysis-output.schema.yaml');
      break;
    case ReportType.COMPETITION:
      schemaPath = path.join(process.cwd(), 'schemas', 'analysis-factors', 'competition', 'competition-output.schema.yaml');
      break;
    case ReportType.FINAL_SUMMARY:
      schemaPath = path.join(process.cwd(), 'schemas', 'analysis-factors', 'final-summary', 'final-summary-analysis-output.schema.yaml');
      break;
    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  // Load and validate schema
  try {
    const schema = await loadSchema(schemaPath, `${reportType}-schema`);
    const { valid, errors } = validateData(schema, llmResponse);
    if (!valid) {
      console.error(`JSON validation failed for ${reportType}:`, errors);
      throw new Error(`JSON validation failed: ${JSON.stringify(errors)}`);
    }
  } catch (error) {
    console.error('Schema validation error:', error);
    throw new Error(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Validate analysis factors for reports that require them
  switch (reportType) {
    case ReportType.BUSINESS_AND_MOAT:
      await validateAnalysisFactors(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.BusinessAndMoat);
      break;
    case ReportType.PAST_PERFORMANCE:
      await validateAnalysisFactors(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.PastPerformance);
      break;
    case ReportType.FUTURE_GROWTH:
      await validateAnalysisFactors(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.FutureGrowth);
      break;
    case ReportType.FINANCIAL_ANALYSIS:
      await validateAnalysisFactors(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.FinancialStatementAnalysis);
      break;
    case ReportType.FAIR_VALUE:
      await validateAnalysisFactors(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.FairValue);
      break;
    // No validation needed for COMPETITION and FINAL_SUMMARY as they don't use analysis factors
  }

  // Save the report based on the report type
  switch (reportType) {
    case ReportType.BUSINESS_AND_MOAT:
      await saveBusinessAndMoatFactorAnalysisResponse(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.BusinessAndMoat);
      break;
    case ReportType.PAST_PERFORMANCE:
      await savePastPerformanceFactorAnalysisResponse(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.PastPerformance);
      break;
    case ReportType.FUTURE_GROWTH:
      await saveFutureGrowthFactorAnalysisResponse(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.FutureGrowth);
      break;
    case ReportType.FINANCIAL_ANALYSIS:
      await saveFinancialAnalysisFactorAnalysisResponse(
        ticker,
        exchange,
        llmResponse as LLMFactorAnalysisResponse,
        TickerAnalysisCategory.FinancialStatementAnalysis
      );
      break;
    case ReportType.COMPETITION:
      await saveCompetitionAnalysisResponse(ticker, exchange, llmResponse as CompetitionAnalysisResponse);
      break;
    case ReportType.FAIR_VALUE:
      await saveFairValueFactorAnalysisResponse(ticker, exchange, llmResponse as LLMFactorAnalysisResponse, TickerAnalysisCategory.FairValue);
      break;
    case ReportType.FINAL_SUMMARY:
      const finalSummaryResponse = llmResponse as FinalSummaryResponse;
      await saveFinalSummaryResponse(
        ticker,
        exchange,
        finalSummaryResponse.finalSummary,
        finalSummaryResponse.metaDescription,
        finalSummaryResponse.aboutReport
      );
      break;
    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  return {
    success: true,
    message: 'Report saved successfully',
  };
}

export const POST = withErrorHandlingV2<{ success: boolean; message: string }>(postHandler);
