import { CommodityReportType, COMMODITY_REPORT_TYPE_TO_CATEGORY } from '@/types/commodity/commodity-analysis-types';
import {
  saveCommodityFactorAnalysisResponse,
  saveCommodityFinalSummaryResponse,
  saveCommodityKeyFactsResponse,
} from '@/utils/commodity-analysis-reports/save-commodity-report-utils';

export interface SaveCommodityReportArgs {
  slug: string;
  reportType: CommodityReportType;
  /** Raw LLM JSON — dispatched to the matching strongly-typed save function below. */
  llmResponse: any;
}

/**
 * Persist one generated commodity report, dispatching the raw LLM JSON to the
 * matching strongly-typed save function (which also recomputes the cached score).
 * Each report type is generated independently on demand, so there is no request
 * queue to advance — unlike the earlier request-based flow.
 */
export async function saveCommodityReport({ slug, reportType, llmResponse }: SaveCommodityReportArgs): Promise<void> {
  if (reportType === CommodityReportType.FINAL_SUMMARY) {
    await saveCommodityFinalSummaryResponse(slug, llmResponse);
    return;
  }

  if (reportType === CommodityReportType.KEY_FACTS) {
    await saveCommodityKeyFactsResponse(slug, llmResponse);
    return;
  }

  const categoryKey = COMMODITY_REPORT_TYPE_TO_CATEGORY[reportType];
  if (!categoryKey) {
    throw new Error(`Unsupported commodity report type: ${reportType}`);
  }
  await saveCommodityFactorAnalysisResponse(slug, llmResponse, categoryKey);
}
