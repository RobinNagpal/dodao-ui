import { ReportType } from '@/types/ticker-typesv1';
import { TickerV1, TickerV1GenerationRequest } from '@prisma/client';

export interface TickerWithMissingReportInfo extends TickerV1 {
  businessAndMoatFactorResultsCount: number;
  financialAnalysisFactorsResultsCount: number;
  pastPerformanceFactorsResultsCount: number;
  futureGrowthFactorsResultsCount: number;
  fairValueFactorsResultsCount: number;

  // existing flags
  isMissingFinalSummaryReport: boolean;
  isMissingCompetitionReport: boolean;
  isMissingBillAckmanReport: boolean;
  isMissingWarrenBuffettReport: boolean;
  isMissingCharlieMungerReport: boolean;

  // NEW
  isMissingMetaDescriptionReport: boolean;
  isMissingAboutReport: boolean;
  isMissingFutureRiskReport: boolean;

  industry: {
    name: string;
    industryKey: string;
  };

  subIndustry: {
    name: string;
    subIndustryKey: string;
  };
}

export function getMissingReportTypes(ticker: TickerWithMissingReportInfo): ReportType[] {
  const missingReports: ReportType[] = [];

  if (ticker.businessAndMoatFactorResultsCount === 0) missingReports.push(ReportType.BUSINESS_AND_MOAT);
  if (ticker.financialAnalysisFactorsResultsCount === 0) missingReports.push(ReportType.FINANCIAL_ANALYSIS);
  if (ticker.pastPerformanceFactorsResultsCount === 0) missingReports.push(ReportType.PAST_PERFORMANCE);
  if (ticker.futureGrowthFactorsResultsCount === 0) missingReports.push(ReportType.FUTURE_GROWTH);
  if (ticker.fairValueFactorsResultsCount === 0) missingReports.push(ReportType.FAIR_VALUE);
  if (ticker.isMissingWarrenBuffettReport) missingReports.push(ReportType.WARREN_BUFFETT);
  if (ticker.isMissingCharlieMungerReport) missingReports.push(ReportType.CHARLIE_MUNGER);
  if (ticker.isMissingBillAckmanReport) missingReports.push(ReportType.BILL_ACKMAN);
  if (ticker.isMissingFinalSummaryReport) missingReports.push(ReportType.FINAL_SUMMARY);
  if (ticker.isMissingCompetitionReport) missingReports.push(ReportType.COMPETITION);
  if (ticker.isMissingFutureRiskReport) missingReports.push(ReportType.FUTURE_RISK);

  // If AboutReport is missing, add FINAL_SUMMARY to regenerate it
  // (only if it's not already in the list)
  if (ticker.isMissingAboutReport && !missingReports.includes(ReportType.FINAL_SUMMARY)) {
    missingReports.push(ReportType.FINAL_SUMMARY);
  }

  // If MetaDescription is missing, add FINAL_SUMMARY to regenerate it
  // (only if it's not already in the list)
  if (ticker.isMissingMetaDescriptionReport && !missingReports.includes(ReportType.FINAL_SUMMARY)) {
    missingReports.push(ReportType.FINAL_SUMMARY);
  }

  return missingReports;
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

  return pendingSteps;
}

export function getMissingReportCount(ticker: TickerWithMissingReportInfo) {
  const missingReportCount = [
    ticker.businessAndMoatFactorResultsCount === 0,
    ticker.financialAnalysisFactorsResultsCount === 0,
    ticker.pastPerformanceFactorsResultsCount === 0,
    ticker.futureGrowthFactorsResultsCount === 0,
    ticker.fairValueFactorsResultsCount === 0,
    ticker.isMissingWarrenBuffettReport,
    ticker.isMissingCharlieMungerReport,
    ticker.isMissingBillAckmanReport,
    ticker.isMissingFinalSummaryReport,
    ticker.isMissingCompetitionReport,
    ticker.isMissingMetaDescriptionReport,
    ticker.isMissingAboutReport,
    ticker.isMissingFutureRiskReport,
  ].filter(Boolean).length;

  const totalReportCount = 13; // Total number of possible reports
  return { missingReportCount, totalReportCount };
}
