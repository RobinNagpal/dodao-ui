import { ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { trigggerGenerationOfAReport } from '@/utils/analysis-reports/generation-report-utils';
import {
  saveBusinessAndMoatFactorAnalysisResponse,
  saveFairValueFactorAnalysisResponse,
  saveFinalSummaryResponse,
  saveFinancialAnalysisFactorAnalysisResponse,
  saveFutureGrowthFactorAnalysisResponse,
  saveInvestorAnalysisResponse,
  savePastPerformanceFactorAnalysisResponse,
} from '@/utils/analysis-reports/save-report-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }) {
  const { ticker } = await params;

  const { llmResponse, additionalData } = await req.json();
  const { reportType, generationRequestId } = additionalData;

  // Save the report based on the report type
  switch (reportType) {
    case ReportType.BUSINESS_AND_MOAT:
      await saveBusinessAndMoatFactorAnalysisResponse(ticker, llmResponse, TickerAnalysisCategory.BusinessAndMoat);
      break;
    case ReportType.PAST_PERFORMANCE:
      await savePastPerformanceFactorAnalysisResponse(ticker, llmResponse, TickerAnalysisCategory.PastPerformance);
      break;
    case ReportType.FUTURE_GROWTH:
      await saveFutureGrowthFactorAnalysisResponse(ticker, llmResponse, TickerAnalysisCategory.FutureGrowth);
      break;
    case ReportType.FINANCIAL_ANALYSIS:
      await saveFinancialAnalysisFactorAnalysisResponse(ticker, llmResponse, TickerAnalysisCategory.FinancialStatementAnalysis);
      break;
    case ReportType.FAIR_VALUE:
      await saveFairValueFactorAnalysisResponse(ticker, llmResponse, TickerAnalysisCategory.FairValue);
      break;
    case ReportType.FINAL_SUMMARY:
      await saveFinalSummaryResponse(ticker, llmResponse.finalSummary, llmResponse.metaDescription);
      break;
    case ReportType.WARREN_BUFFETT:
    case ReportType.CHARLIE_MUNGER:
    case ReportType.BILL_ACKMAN:
      await saveInvestorAnalysisResponse(ticker, llmResponse, reportType);
      break;
    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  // Trigger generation of the next report
  if (generationRequestId) {
    await trigggerGenerationOfAReport(ticker, generationRequestId);
  }

  return {
    success: true,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
