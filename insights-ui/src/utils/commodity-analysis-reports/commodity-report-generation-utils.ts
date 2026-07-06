import { CommodityReportType, COMMODITY_PROMPT_KEYS } from '@/types/commodity/commodity-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { callCommodityLLMResponse } from '@/utils/commodity-analysis-reports/commodity-llm-utils';
import { prepareCommodityInputJson } from '@/utils/commodity-analysis-reports/commodity-report-input-json-utils';
import { fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';

/**
 * Generate ONE commodity report type in the background and save it — the whole
 * commodity generation model. There is no request queue or step orchestration
 * (only ~22 commodities): the admin generates each report type on demand, the
 * LLM runs in-process, and `saveCommodityReport` persists the result + recomputes
 * the score. Mirrors the tariff per-section generation (fire-and-forget).
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
      await callCommodityLLMResponse({
        slug,
        inputJson,
        promptKey: COMMODITY_PROMPT_KEYS[reportType],
        spaceId: KoalaGainsSpaceId,
        reportType,
      });
    } catch (err) {
      console.error(`Commodity report "${reportType}" generation failed to start for "${slug}":`, err);
    }
  })();
}
