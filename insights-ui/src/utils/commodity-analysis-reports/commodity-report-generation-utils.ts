import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { generateCommodityReportResponse } from '@/utils/commodity-analysis-reports/commodity-llm-utils';
import { prepareCommodityInputJson } from '@/utils/commodity-analysis-reports/commodity-report-input-json-utils';
import { fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { saveCommodityReport } from '@/utils/commodity-analysis-reports/save-commodity-report-callback-utils';

/**
 * Generate ONE commodity report type in the background and save it — the whole
 * commodity generation model. There is no request queue, no step orchestration,
 * and no prompt/invocation storage (only ~22 commodities): the admin generates
 * each report type on demand, the LLM runs in-process against a file-backed
 * prompt, and `saveCommodityReport` persists the result + recomputes the score.
 * Mirrors the tariff per-section generation (fire-and-forget).
 *
 * Final Summary depends on the four scored categories, so the admin generates it
 * last — there is intentionally no "generate all".
 */
export function startCommodityReportGeneration(slug: string, reportType: CommodityReportType): void {
  // Fire-and-forget. The `.catch` is mandatory — an unhandled rejection in a
  // detached promise can take the Node process down.
  void (async (): Promise<void> => {
    try {
      const commodity = await fetchCommodityWithAllData(slug);
      const inputJson = prepareCommodityInputJson(commodity, reportType);
      const llmResponse = await generateCommodityReportResponse(reportType, inputJson);
      await saveCommodityReport({ slug, reportType, llmResponse });
      console.log(`[${reportType}] [${slug}] commodity report generated and saved`);
    } catch (err) {
      console.error(`Commodity report "${reportType}" generation failed for "${slug}":`, err);
    }
  })();
}
