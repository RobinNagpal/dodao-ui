import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { EtfGenerationRequest } from '@prisma/client';

export function calculateEtfPendingSteps(request: EtfGenerationRequest): EtfReportType[] {
  const pendingSteps: EtfReportType[] = [];

  if (
    request.regeneratePerformanceAndReturns &&
    !request.completedSteps.includes(EtfReportType.PERFORMANCE_AND_RETURNS) &&
    !request.failedSteps.includes(EtfReportType.PERFORMANCE_AND_RETURNS)
  ) {
    pendingSteps.push(EtfReportType.PERFORMANCE_AND_RETURNS);
  }

  if (
    request.regenerateCostEfficiencyAndTeam &&
    !request.completedSteps.includes(EtfReportType.COST_EFFICIENCY_AND_TEAM) &&
    !request.failedSteps.includes(EtfReportType.COST_EFFICIENCY_AND_TEAM)
  ) {
    pendingSteps.push(EtfReportType.COST_EFFICIENCY_AND_TEAM);
  }

  if (
    request.regenerateRiskAnalysis &&
    !request.completedSteps.includes(EtfReportType.RISK_ANALYSIS) &&
    !request.failedSteps.includes(EtfReportType.RISK_ANALYSIS)
  ) {
    pendingSteps.push(EtfReportType.RISK_ANALYSIS);
  }

  if (
    request.regenerateFuturePerformanceOutlook &&
    !request.completedSteps.includes(EtfReportType.FUTURE_PERFORMANCE_OUTLOOK) &&
    !request.failedSteps.includes(EtfReportType.FUTURE_PERFORMANCE_OUTLOOK)
  ) {
    pendingSteps.push(EtfReportType.FUTURE_PERFORMANCE_OUTLOOK);
  }

  if (
    request.regenerateIndexStrategy &&
    !request.completedSteps.includes(EtfReportType.INDEX_STRATEGY) &&
    !request.failedSteps.includes(EtfReportType.INDEX_STRATEGY)
  ) {
    pendingSteps.push(EtfReportType.INDEX_STRATEGY);
  }

  if (
    request.regenerateFinalSummary &&
    !request.completedSteps.includes(EtfReportType.FINAL_SUMMARY) &&
    !request.failedSteps.includes(EtfReportType.FINAL_SUMMARY)
  ) {
    pendingSteps.push(EtfReportType.FINAL_SUMMARY);
  }

  return pendingSteps;
}
