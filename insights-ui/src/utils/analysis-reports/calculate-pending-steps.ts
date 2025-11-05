import { ReportType } from '@/types/ticker-typesv1';
import { TickerV1GenerationRequest } from '@prisma/client';

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
