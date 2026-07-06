import { CommodityReportType, getCommodityOutputSchema } from '@/types/commodity/commodity-analysis-types';
import { getLlmResponse } from '@/scripts/llm‑utils‑gemini';
import { compileTemplate } from '@/util/get-llm-response';
import { revalidateCommodity } from '@/utils/commodity-analysis-reports/commodity-cache-utils';
import { prepareCommodityInputJson } from '@/utils/commodity-analysis-reports/commodity-report-input-json-utils';
import { resolveCommodityPromptTemplate } from '@/utils/commodity-analysis-reports/commodity-prompt-template-utils';
import { fetchCommodityWithAllData } from '@/utils/commodity-analysis-reports/get-commodity-report-data-utils';
import { saveCommodityReport } from '@/utils/commodity-analysis-reports/save-commodity-report-callback-utils';

/**
 * Generate ONE commodity report type in the background and save it — the whole
 * commodity generation model. There is no request queue, no step orchestration,
 * and no prompt/invocation storage (only ~22 commodities): embed the input into
 * the file-backed prompt template and call the shared `getLlmResponse` (the same
 * helper the tariff scripts use) for structured output, then `saveCommodityReport`
 * persists the result + recomputes the score. Fire-and-forget.
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
      const prompt = compileTemplate(resolveCommodityPromptTemplate(reportType), inputJson);
      const llmResponse = await getLlmResponse(prompt, getCommodityOutputSchema(reportType));
      await saveCommodityReport({ slug, reportType, llmResponse });
      // Purge both cache layers for just this commodity (Next.js slug tag +
      // CloudFront page subtree + per-slug API endpoints). The `/commodities`
      // listing is intentionally left alone — it rides its 1-week TTL.
      revalidateCommodity(slug);
      console.log(`[${reportType}] [${slug}] commodity report generated, saved, and cache invalidated`);
    } catch (err) {
      console.error(`Commodity report "${reportType}" generation failed for "${slug}":`, err);
    }
  })();
}
