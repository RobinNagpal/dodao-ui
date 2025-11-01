import { NextRequest, NextResponse } from 'next/server';
import { ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import {
  saveBusinessAndMoatFactorAnalysisResponse,
  savePastPerformanceFactorAnalysisResponse,
  saveFutureGrowthFactorAnalysisResponse,
  saveFinancialAnalysisFactorAnalysisResponse,
  saveFairValueFactorAnalysisResponse,
  saveInvestorAnalysisResponse,
  saveFinalSummaryResponse,
} from '@/utils/analysis-reports/save-report-utils';
import { trigggerGenerationOfAReport } from '@/utils/analysis-reports/generation-report-utils';

export async function POST(req: NextRequest, { params }: { params: { spaceId: string; ticker: string } }) {
  try {
    const { llmResponse, additionalData } = await req.json();
    const { reportType, generationRequestId } = additionalData;
    const ticker = params.ticker;

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
      case ReportType.WARREN_BUFFETT:
      case ReportType.CHARLIE_MUNGER:
      case ReportType.BILL_ACKMAN:
        await saveInvestorAnalysisResponse(ticker, llmResponse, reportType);
        break;
      case ReportType.FINAL_SUMMARY:
        await saveFinalSummaryResponse(ticker, llmResponse.finalSummary, llmResponse.metaDescription);
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    // Trigger generation of the next report
    if (generationRequestId) {
      await trigggerGenerationOfAReport(ticker, generationRequestId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving report:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
