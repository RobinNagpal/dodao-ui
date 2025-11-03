import { prisma } from '@/prisma';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { TickerV1, TickerV1GenerationRequest } from '@prisma/client';

/**
 * Helper function to check if a report should be regenerated
 */
export function shouldRegenerateReport(request: TickerV1GenerationRequest, reportType: ReportType): boolean {
  switch (reportType) {
    case ReportType.COMPETITION:
      return request.regenerateCompetition;
    case ReportType.FINANCIAL_ANALYSIS:
      return request.regenerateFinancialAnalysis;
    case ReportType.BUSINESS_AND_MOAT:
      return request.regenerateBusinessAndMoat;
    case ReportType.PAST_PERFORMANCE:
      return request.regeneratePastPerformance;
    case ReportType.FUTURE_GROWTH:
      return request.regenerateFutureGrowth;
    case ReportType.FAIR_VALUE:
      return request.regenerateFairValue;
    case ReportType.FUTURE_RISK:
      return request.regenerateFutureRisk;
    case ReportType.WARREN_BUFFETT:
      return request.regenerateWarrenBuffett;
    case ReportType.CHARLIE_MUNGER:
      return request.regenerateCharlieMunger;
    case ReportType.BILL_ACKMAN:
      return request.regenerateBillAckman;
    case ReportType.FINAL_SUMMARY:
      return request.regenerateFinalSummary;
    case ReportType.CACHED_SCORE:
      return request.regenerateCachedScore;
    default:
      console.error(`Unknown report type: ${reportType}`);
      return false;
  }
}

/**
 * Checks if all reports that should be regenerated have been attempted (either completed or failed)
 */
export function areAllReportsAttempted(generationRequest: TickerV1GenerationRequest): boolean {
  return Object.entries(generationRequest)
    .filter(([key, value]) => key.startsWith('regenerate') && value === true)
    .every(([key]) => {
      const reportType = key.replace('regenerate', '');
      const reportTypeKey = Object.values(ReportType).find((type) => type.toUpperCase() === reportType.toUpperCase());
      return reportTypeKey && (generationRequest.completedSteps.includes(reportTypeKey) || generationRequest.failedSteps.includes(reportTypeKey));
    });
}

/**
 * Updates the generation request status for first-time runs
 */
export async function updateInitialStatus(generationRequest: TickerV1GenerationRequest & { ticker: TickerV1 }): Promise<void> {
  if (generationRequest.status === GenerationRequestStatus.NotStarted) {
    console.log('Starting generation request for', generationRequest.ticker.symbol);
    await prisma.tickerV1GenerationRequest.update({
      where: {
        id: generationRequest.id,
      },
      data: {
        status: GenerationRequestStatus.InProgress,
        startedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    console.log('Generation request does not need to be updated for', generationRequest.ticker.symbol, 'because it is already :', generationRequest.status);
  }
}

export async function markAsCompleted(generationRequest: TickerV1GenerationRequest): Promise<void> {
  const hasFailed = generationRequest.failedSteps.length > 0;

  await prisma.tickerV1GenerationRequest.update({
    where: {
      id: generationRequest.id,
    },
    data: {
      status: hasFailed ? GenerationRequestStatus.Failed : GenerationRequestStatus.Completed,
      completedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export function calculatePendingSteps(request: TickerV1GenerationRequest): ReportType[] {
  const pendingSteps: ReportType[] = [];

  // Check each report type
  if (request.regenerateCompetition && !request.completedSteps.includes(ReportType.COMPETITION) && !request.failedSteps.includes(ReportType.COMPETITION)) {
    pendingSteps.push(ReportType.COMPETITION);
  }

  if (
    request.regenerateFinancialAnalysis &&
    !request.completedSteps.includes(ReportType.FINANCIAL_ANALYSIS) &&
    !request.failedSteps.includes(ReportType.FINANCIAL_ANALYSIS)
  ) {
    pendingSteps.push(ReportType.FINANCIAL_ANALYSIS);
  }

  if (
    request.regenerateBusinessAndMoat &&
    !request.completedSteps.includes(ReportType.BUSINESS_AND_MOAT) &&
    !request.failedSteps.includes(ReportType.BUSINESS_AND_MOAT)
  ) {
    pendingSteps.push(ReportType.BUSINESS_AND_MOAT);
  }

  if (
    request.regeneratePastPerformance &&
    !request.completedSteps.includes(ReportType.PAST_PERFORMANCE) &&
    !request.failedSteps.includes(ReportType.PAST_PERFORMANCE)
  ) {
    pendingSteps.push(ReportType.PAST_PERFORMANCE);
  }

  if (request.regenerateFutureGrowth && !request.completedSteps.includes(ReportType.FUTURE_GROWTH) && !request.failedSteps.includes(ReportType.FUTURE_GROWTH)) {
    pendingSteps.push(ReportType.FUTURE_GROWTH);
  }

  if (request.regenerateFairValue && !request.completedSteps.includes(ReportType.FAIR_VALUE) && !request.failedSteps.includes(ReportType.FAIR_VALUE)) {
    pendingSteps.push(ReportType.FAIR_VALUE);
  }

  if (request.regenerateFutureRisk && !request.completedSteps.includes(ReportType.FUTURE_RISK) && !request.failedSteps.includes(ReportType.FUTURE_RISK)) {
    pendingSteps.push(ReportType.FUTURE_RISK);
  }

  if (
    request.regenerateWarrenBuffett &&
    !request.completedSteps.includes(ReportType.WARREN_BUFFETT) &&
    !request.failedSteps.includes(ReportType.WARREN_BUFFETT)
  ) {
    pendingSteps.push(ReportType.WARREN_BUFFETT);
  }

  if (
    request.regenerateCharlieMunger &&
    !request.completedSteps.includes(ReportType.CHARLIE_MUNGER) &&
    !request.failedSteps.includes(ReportType.CHARLIE_MUNGER)
  ) {
    pendingSteps.push(ReportType.CHARLIE_MUNGER);
  }

  if (request.regenerateBillAckman && !request.completedSteps.includes(ReportType.BILL_ACKMAN) && !request.failedSteps.includes(ReportType.BILL_ACKMAN)) {
    pendingSteps.push(ReportType.BILL_ACKMAN);
  }

  if (request.regenerateFinalSummary && !request.completedSteps.includes(ReportType.FINAL_SUMMARY) && !request.failedSteps.includes(ReportType.FINAL_SUMMARY)) {
    pendingSteps.push(ReportType.FINAL_SUMMARY);
  }

  if (request.regenerateCachedScore && !request.completedSteps.includes(ReportType.CACHED_SCORE) && !request.failedSteps.includes(ReportType.CACHED_SCORE)) {
    pendingSteps.push(ReportType.CACHED_SCORE);
  }

  return pendingSteps;
}
