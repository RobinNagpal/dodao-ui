import { prisma } from '@/prisma';
import { InvestorTypes, ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { triggerGenerationOfAReportSimplified } from '@/utils/analysis-reports/generation-report-utils';
import {
  saveBusinessAndMoatFactorAnalysisResponse,
  saveCompetitionAnalysisResponse,
  saveFairValueFactorAnalysisResponse,
  saveFinalSummaryResponse,
  saveFinancialAnalysisFactorAnalysisResponse,
  saveFutureGrowthFactorAnalysisResponse,
  saveFutureRiskResponse,
  saveInvestorAnalysisResponse,
  savePastPerformanceFactorAnalysisResponse,
} from '@/utils/analysis-reports/save-report-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string; ticker: string }> }) {
  const { ticker } = await params;

  const { llmResponse, additionalData } = await req.json();
  const { reportType, generationRequestId } = additionalData;
  console.log('Got request to save report with the following info', {
    llmResponse,
    additionalData,
  });
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
    case ReportType.COMPETITION:
      await saveCompetitionAnalysisResponse(ticker, llmResponse);
      break;
    case ReportType.FAIR_VALUE:
      await saveFairValueFactorAnalysisResponse(ticker, llmResponse, TickerAnalysisCategory.FairValue);
      break;
    case ReportType.FUTURE_RISK:
      await saveFutureRiskResponse(ticker, llmResponse);
      break;
    case ReportType.FINAL_SUMMARY:
      await saveFinalSummaryResponse(ticker, llmResponse.finalSummary, llmResponse.metaDescription, llmResponse.aboutReport);
      break;
    case ReportType.WARREN_BUFFETT:
      await saveInvestorAnalysisResponse(ticker, llmResponse, InvestorTypes.WARREN_BUFFETT);
      break;
    case ReportType.CHARLIE_MUNGER:
      await saveInvestorAnalysisResponse(ticker, llmResponse, InvestorTypes.CHARLIE_MUNGER);
      break;
    case ReportType.BILL_ACKMAN:
      await saveInvestorAnalysisResponse(ticker, llmResponse, InvestorTypes.BILL_ACKMAN);
      break;
    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  // If we have a generation request ID, update the generation request to mark this report as completed
  if (generationRequestId) {
    // Get the current generation request
    const generationRequest = await prisma.tickerV1GenerationRequest.findUniqueOrThrow({
      where: { id: generationRequestId },
    });

    // Add the current report to completedSteps if it's not already there
    const updatedCompletedSteps = [...generationRequest.completedSteps];
    if (!updatedCompletedSteps.includes(reportType)) {
      updatedCompletedSteps.push(reportType);
    }

    // Update the generation request
    await prisma.tickerV1GenerationRequest.update({
      where: { id: generationRequestId },
      data: {
        completedSteps: updatedCompletedSteps,
        inProgressStep: null,
        lastInvocationTime: null,
      },
    });

    // Trigger generation of the next report
    await triggerGenerationOfAReportSimplified(ticker, generationRequestId);
  }

  return {
    success: true,
  };
}

export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
