import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  EtfAnalysisCategory,
  EtfGenerationRequestStatus,
  EtfReportType,
  ETF_PROMPT_KEYS,
  ETF_REPORT_TYPE_TO_CATEGORY,
} from '@/types/etf/etf-analysis-types';
import { fetchEtfWithAllData, EtfWithAllData } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';
import {
  prepareCostEfficiencyAndTeamInputJson,
  preparePerformanceAndReturnsInputJson,
  prepareRiskAnalysisInputJson,
} from '@/utils/etf-analysis-reports/etf-report-input-json-utils';
import { markEtfRequestAsCompleted, markEtfRequestAsInProgress } from '@/utils/etf-analysis-reports/etf-report-status-utils';
import { calculateEtfPendingSteps } from '@/utils/etf-analysis-reports/etf-report-steps-statuses';
import { callEtfLambdaForLLMResponse } from '@/utils/etf-analysis-reports/etf-llm-lambda-utils';

export const etfReportDependencyMap: Record<EtfReportType, EtfReportType[]> = {
  [EtfReportType.PERFORMANCE_AND_RETURNS]: [],
  [EtfReportType.COST_EFFICIENCY_AND_TEAM]: [],
  [EtfReportType.RISK_ANALYSIS]: [],
};

export const etfDependencyBasedReportOrder: EtfReportType[] = [
  EtfReportType.PERFORMANCE_AND_RETURNS,
  EtfReportType.COST_EFFICIENCY_AND_TEAM,
  EtfReportType.RISK_ANALYSIS,
];

function prepareInputJsonForReportType(etf: EtfWithAllData, reportType: EtfReportType) {
  switch (reportType) {
    case EtfReportType.PERFORMANCE_AND_RETURNS:
      return preparePerformanceAndReturnsInputJson(etf);
    case EtfReportType.COST_EFFICIENCY_AND_TEAM:
      return prepareCostEfficiencyAndTeamInputJson(etf);
    case EtfReportType.RISK_ANALYSIS:
      return prepareRiskAnalysisInputJson(etf);
  }
}

async function generateEtfCategoryAnalysis(
  spaceId: string,
  etf: EtfWithAllData,
  generationRequestId: string,
  reportType: EtfReportType
): Promise<void> {
  const inputJson = prepareInputJsonForReportType(etf, reportType);
  const promptKey = ETF_PROMPT_KEYS[reportType];

  await callEtfLambdaForLLMResponse({
    symbol: etf.symbol,
    exchange: etf.exchange,
    generationRequestId,
    inputJson,
    promptKey,
    spaceId,
    reportType,
  });
}

export async function triggerEtfGenerationOfAReport(symbol: string, exchange: string, generationRequestId: string): Promise<void> {
  let generationRequest = await prisma.etfGenerationRequest.findUniqueOrThrow({
    where: { id: generationRequestId },
    include: { etf: true },
  });

  const etfRecord = await fetchEtfWithAllData(symbol, exchange);
  const spaceId = KoalaGainsSpaceId;

  if (generationRequest.status === EtfGenerationRequestStatus.Completed) {
    console.log('ETF generation request is already completed - skipping', symbol, 'on exchange', exchange);
    return;
  }

  const pendingSteps = calculateEtfPendingSteps(generationRequest);
  if (pendingSteps.length === 0) {
    console.log(`No pending steps for ETF ${symbol}. Marking as completed.`);
    await markEtfRequestAsCompleted(generationRequest);
    return;
  }

  if (generationRequest.status === EtfGenerationRequestStatus.InProgress) {
    const inProgressStep = generationRequest.inProgressStep;
    const lastInvocationTime = generationRequest.lastInvocationTime;

    if (!inProgressStep || !lastInvocationTime) {
      await prisma.etfGenerationRequest.update({
        where: { id: generationRequest.id },
        data: {
          status: EtfGenerationRequestStatus.Failed,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return;
    }

    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - lastInvocationTime.getTime() < fiveMinutes) {
      console.log(`Waiting for ${inProgressStep} of ETF ${symbol} to finish...`);
      return;
    }

    const failedSteps = [...generationRequest.failedSteps];
    if (!failedSteps.includes(inProgressStep)) {
      failedSteps.push(inProgressStep);
    }

    Object.entries(etfReportDependencyMap).forEach(([reportType, dependencies]) => {
      if (dependencies.includes(inProgressStep as EtfReportType) && !failedSteps.includes(reportType as EtfReportType)) {
        failedSteps.push(reportType as EtfReportType);
      }
    });

    generationRequest = await prisma.etfGenerationRequest.update({
      where: { id: generationRequest.id },
      data: {
        failedSteps: [...new Set(failedSteps)],
        inProgressStep: null,
        updatedAt: new Date(),
      },
      include: { etf: true },
    });
  }

  const latestPendingSteps = calculateEtfPendingSteps(generationRequest);
  const nextStep = etfDependencyBasedReportOrder.find((step) => latestPendingSteps.includes(step));

  if (!nextStep) {
    await markEtfRequestAsCompleted(generationRequest);
    return;
  }

  await markEtfRequestAsInProgress(generationRequest, nextStep);

  try {
    await generateEtfCategoryAnalysis(spaceId, etfRecord, generationRequest.id, nextStep);
  } catch (error) {
    console.error(`Error generating ETF ${nextStep} for ${symbol}:`, error);
    await prisma.etfGenerationRequest.update({
      where: { id: generationRequest.id },
      data: {
        failedSteps: [...generationRequest.failedSteps, nextStep],
        inProgressStep: null,
        updatedAt: new Date(),
      },
    });
  }
}
