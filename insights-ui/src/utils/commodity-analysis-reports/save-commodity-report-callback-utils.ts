import { prisma } from '@/prisma';
import { CommodityReportType, COMMODITY_REPORT_TYPE_TO_CATEGORY } from '@/types/commodity/commodity-analysis-types';
import { triggerCommodityGenerationOfAReport } from '@/utils/commodity-analysis-reports/commodity-generation-report-utils';
import {
  saveCommodityFactorAnalysisResponse,
  saveCommodityFinalSummaryResponse,
  saveCommodityKeyFactsResponse,
} from '@/utils/commodity-analysis-reports/save-commodity-report-utils';

export interface SaveCommodityReportAndAdvanceArgs {
  slug: string;
  reportType: CommodityReportType;
  /** Raw LLM JSON — dispatched to the matching strongly-typed save function below. */
  llmResponse: any;
  generationRequestId?: string;
}

/**
 * Persist one commodity report and advance its generation request. The single
 * shared function both execution paths run (the in-process background path calls
 * it directly; an HTTP callback route awaits it). Mirrors
 * `saveEtfReportAndAdvanceGeneration`.
 */
export async function saveCommodityReportAndAdvanceGeneration(args: SaveCommodityReportAndAdvanceArgs): Promise<void> {
  const { slug, reportType, llmResponse, generationRequestId } = args;

  if (reportType === CommodityReportType.FINAL_SUMMARY) {
    await saveCommodityFinalSummaryResponse(slug, llmResponse);
  } else if (reportType === CommodityReportType.KEY_FACTS) {
    await saveCommodityKeyFactsResponse(slug, llmResponse);
  } else {
    const categoryKey = COMMODITY_REPORT_TYPE_TO_CATEGORY[reportType];
    if (!categoryKey) {
      throw new Error(`Unsupported commodity report type: ${reportType}`);
    }
    await saveCommodityFactorAnalysisResponse(slug, llmResponse, categoryKey);
  }

  if (generationRequestId) {
    const generationRequest = await prisma.commodityGenerationRequest.findUniqueOrThrow({ where: { id: generationRequestId } });
    const completedSteps = [...generationRequest.completedSteps];
    if (!completedSteps.includes(reportType)) completedSteps.push(reportType);

    await prisma.commodityGenerationRequest.update({
      where: { id: generationRequestId },
      data: { completedSteps, inProgressStep: null },
    });

    await triggerCommodityGenerationOfAReport(slug, generationRequestId);
  }
}
