import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CommodityGenerationRequestStatus, CommodityReportType, COMMODITY_PROMPT_KEYS } from '@/types/commodity/commodity-analysis-types';
import { fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { prepareCommodityInputJson } from '@/utils/commodity-analysis-reports/commodity-report-input-json-utils';
import { markCommodityRequestAsCompleted, markCommodityRequestAsInProgress } from '@/utils/commodity-analysis-reports/commodity-report-status-utils';
import { calculateCommodityPendingSteps } from '@/utils/commodity-analysis-reports/commodity-report-steps-statuses';
import { callCommodityLLMResponse } from '@/utils/commodity-analysis-reports/commodity-llm-utils';

/**
 * Which steps must finish before another can run. Only the Final Summary has
 * dependencies — it synthesizes the four scored categories, so it waits for
 * them (Key Facts is independent).
 */
export const commodityReportDependencyMap: Record<CommodityReportType, CommodityReportType[]> = {
  [CommodityReportType.SUPPLY_AND_DEMAND]: [],
  [CommodityReportType.PRICE_AND_VALUE]: [],
  [CommodityReportType.VOLATILITY_AND_RISK]: [],
  [CommodityReportType.FUTURE_OUTLOOK]: [],
  [CommodityReportType.KEY_FACTS]: [],
  [CommodityReportType.FINAL_SUMMARY]: [
    CommodityReportType.SUPPLY_AND_DEMAND,
    CommodityReportType.PRICE_AND_VALUE,
    CommodityReportType.VOLATILITY_AND_RISK,
    CommodityReportType.FUTURE_OUTLOOK,
  ],
};

export const commodityDependencyBasedReportOrder: CommodityReportType[] = [
  CommodityReportType.SUPPLY_AND_DEMAND,
  CommodityReportType.PRICE_AND_VALUE,
  CommodityReportType.VOLATILITY_AND_RISK,
  CommodityReportType.FUTURE_OUTLOOK,
  CommodityReportType.KEY_FACTS,
  CommodityReportType.FINAL_SUMMARY,
];

/**
 * Advance one commodity generation request by exactly one step: pick the next
 * pending step (respecting dependencies), mark it in-progress, and fire the LLM
 * call. The in-process background task saves the result and calls back into this
 * function to trigger the following step. Mirrors `triggerEtfGenerationOfAReport`
 * but uses `updatedAt` for the stale-step guard (commodity requests have no
 * `lastInvocationTime` column).
 */
export async function triggerCommodityGenerationOfAReport(slug: string, generationRequestId: string): Promise<void> {
  let generationRequest = await prisma.commodityGenerationRequest.findUniqueOrThrow({
    where: { id: generationRequestId },
  });

  const commodity = await fetchCommodityWithAllData(slug);
  const spaceId = KoalaGainsSpaceId;

  if (generationRequest.status === CommodityGenerationRequestStatus.Completed) {
    console.log('Commodity generation request already completed - skipping', slug);
    return;
  }

  const pendingSteps = calculateCommodityPendingSteps(generationRequest);
  if (pendingSteps.length === 0) {
    await markCommodityRequestAsCompleted(generationRequest);
    return;
  }

  // Stale-step guard: if a step has been in-progress for more than 5 minutes,
  // mark it (and anything depending on it) failed so the request can move on.
  if (generationRequest.status === CommodityGenerationRequestStatus.InProgress && generationRequest.inProgressStep) {
    const fiveMinutes = 5 * 60 * 1000;
    const inProgressStep = generationRequest.inProgressStep as CommodityReportType;
    if (Date.now() - generationRequest.updatedAt.getTime() < fiveMinutes) {
      console.log(`Waiting for ${inProgressStep} of commodity ${slug} to finish...`);
      return;
    }

    const failedSteps = [...generationRequest.failedSteps];
    if (!failedSteps.includes(inProgressStep)) failedSteps.push(inProgressStep);
    Object.entries(commodityReportDependencyMap).forEach(([reportType, dependencies]) => {
      if (dependencies.includes(inProgressStep) && !failedSteps.includes(reportType)) {
        failedSteps.push(reportType);
      }
    });

    generationRequest = await prisma.commodityGenerationRequest.update({
      where: { id: generationRequest.id },
      data: { failedSteps: [...new Set(failedSteps)], inProgressStep: null, updatedAt: new Date() },
    });
  }

  const latestPendingSteps = calculateCommodityPendingSteps(generationRequest);
  const nextStep = commodityDependencyBasedReportOrder.find((step) => latestPendingSteps.includes(step));
  if (!nextStep) {
    await markCommodityRequestAsCompleted(generationRequest);
    return;
  }

  await markCommodityRequestAsInProgress(generationRequest, nextStep);

  try {
    const inputJson = prepareCommodityInputJson(commodity, nextStep);
    await callCommodityLLMResponse({
      slug: commodity.slug,
      generationRequestId: generationRequest.id,
      inputJson,
      promptKey: COMMODITY_PROMPT_KEYS[nextStep],
      spaceId,
      reportType: nextStep,
    });
  } catch (error) {
    console.error(`Error generating commodity ${nextStep} for ${slug}:`, error);
    await prisma.commodityGenerationRequest.update({
      where: { id: generationRequest.id },
      data: { failedSteps: [...generationRequest.failedSteps, nextStep], inProgressStep: null, updatedAt: new Date() },
    });
  }
}
