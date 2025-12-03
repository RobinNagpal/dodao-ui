import { prisma } from '@/prisma';
import { InvestorTypes, ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import {
  saveBusinessAndMoatFactorAnalysisResponse,
  saveCompetitionAnalysisResponse,
  saveFairValueFactorAnalysisResponse,
  saveFinalSummaryResponse,
  saveFinancialAnalysisFactorAnalysisResponse,
  saveFutureGrowthFactorAnalysisResponse,
  savePastPerformanceFactorAnalysisResponse,
} from '@/utils/analysis-reports/save-report-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { loadSchema, validateData } from '@/util/get-llm-response';
import path from 'path';

interface SaveJsonReportRequest {
  llmResponse: any;
  reportType: ReportType;
}

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }) {
  const { spaceId, exchange, ticker } = await params;
  const { llmResponse, reportType }: SaveJsonReportRequest = await req.json();

  console.log('Got request to save JSON report with the following info', {
    llmResponse,
    reportType,
    spaceId,
    exchange,
    ticker,
  });

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

  // Save the report based on the report type
  switch (reportType) {
    case ReportType.BUSINESS_AND_MOAT:
      await saveBusinessAndMoatFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.BusinessAndMoat);
      break;
    case ReportType.PAST_PERFORMANCE:
      await savePastPerformanceFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.PastPerformance);
      break;
    case ReportType.FUTURE_GROWTH:
      await saveFutureGrowthFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.FutureGrowth);
      break;
    case ReportType.FINANCIAL_ANALYSIS:
      await saveFinancialAnalysisFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.FinancialStatementAnalysis);
      break;
    case ReportType.COMPETITION:
      await saveCompetitionAnalysisResponse(ticker, exchange, llmResponse);
      break;
    case ReportType.FAIR_VALUE:
      await saveFairValueFactorAnalysisResponse(ticker, exchange, llmResponse, TickerAnalysisCategory.FairValue);
      break;
    case ReportType.FINAL_SUMMARY:
      await saveFinalSummaryResponse(ticker, exchange, llmResponse.finalSummary, llmResponse.metaDescription, llmResponse.aboutReport);
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
