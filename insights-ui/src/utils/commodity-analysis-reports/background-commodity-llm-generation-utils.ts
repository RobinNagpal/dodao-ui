import { CommodityReportType } from '@/types/commodity/commodity-analysis-types';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { saveCommodityReportAndAdvanceGeneration } from '@/utils/commodity-analysis-reports/save-commodity-report-callback-utils';
import { getLLMResponse, updateInvocationStatus } from '@/util/get-llm-response';
import { PromptInvocationStatus } from '@prisma/client';

export interface BackgroundCommodityReportArgs {
  slug: string;
  reportType: CommodityReportType;
  generationRequestId: string;
  invocationId: string;
  llmProvider: LLMProvider;
  model: GeminiModel;
  /** The fully-compiled prompt string (already built by the caller). */
  prompt: string;
  /** The parsed output JSON schema object the response is validated against. */
  outputSchema: object;
}

/**
 * In-process, fire-and-forget LLM runner for commodity report generation — the
 * commodity parallel to `processEtfReportLLMResponseInBackground`. Runs the LLM,
 * then persists + advances by calling `saveCommodityReportAndAdvanceGeneration`
 * directly (no HTTP callback round-trip). Call detached (`void`) so the
 * triggering request returns immediately; the try/catch is mandatory because an
 * unhandled rejection in a detached promise can take the process down.
 */
export async function processCommodityReportLLMResponseInBackground(args: BackgroundCommodityReportArgs): Promise<void> {
  const { slug, reportType, generationRequestId, invocationId, llmProvider, model, prompt, outputSchema } = args;

  try {
    const { result } = await getLLMResponse({
      invocationId,
      llmProvider,
      modelName: model,
      prompt,
      outputSchema,
      maxRetries: 2,
    });

    await saveCommodityReportAndAdvanceGeneration({
      slug,
      reportType,
      llmResponse: result,
      generationRequestId,
    });

    console.log(`[${reportType}] [${slug}] [${generationRequestId}] Background commodity report saved and next step triggered`);
  } catch (error) {
    console.error(`[${reportType}] [${slug}] [${generationRequestId}] Background commodity report generation failed:`, error);
    await updateInvocationStatus(invocationId, PromptInvocationStatus.Failed, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
