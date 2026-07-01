import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { ReportType } from '@/types/ticker-typesv1';
import { saveTickerReportAndAdvanceGeneration } from '@/utils/analysis-reports/save-report-callback-utils';
import { getLLMResponse, updateInvocationStatus } from '@/util/get-llm-response';
import { PromptInvocationStatus } from '@prisma/client';

export interface BackgroundStockReportArgs {
  symbol: string;
  exchange: string;
  reportType: ReportType;
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
 * In-process, fire-and-forget replacement for the AWS Lambda
 * (`lambdas/llm-call-with-callback`) for STOCK report generation.
 *
 * It does exactly what the lambda + callback did, just in this process:
 *  1. Run the LLM via the same `getLLMResponse` core runner, with the same
 *     invocation row / prompt / provider / model / output schema the lambda
 *     would have received.
 *  2. Persist the report and advance the generation request by calling
 *     `saveTickerReportAndAdvanceGeneration` DIRECTLY — the same function the
 *     `save-report-callback` route runs — instead of POSTing back to that route
 *     over HTTP. So revalidation, storage, `completedSteps`, and the next-step
 *     trigger are byte-for-byte the same; only the call mechanism changes (a
 *     function call instead of a network round-trip).
 *
 * Call this detached (`void`) so the triggering request returns immediately,
 * mirroring the lambda's instant ack. The try/catch is mandatory: an unhandled
 * rejection in a detached promise can take down the Node process. On failure we
 * mark the PromptInvocation `Failed` with the error message here — mirroring the
 * lambda's `getLLMResponseInLamnda` wrapper — because `getLLMResponse` only
 * persists the `Failed` status when the call produced a result that failed
 * validation; when it throws before producing any result (e.g. a Gemini 429 /
 * quota error) it re-throws without touching the row, which would otherwise
 * leave the invocation stuck `InProgress` with no error recorded. We
 * deliberately leave the generation request's `inProgressStep` /
 * `lastInvocationTime` untouched so the 5-minute stale-step guard in
 * `triggerGenerationOfAReportSimplified` reclaims the step on the next tick.
 *
 * Caveat (same as the tariff background path): an in-process task lives only in
 * this process's memory, so a redeploy/crash mid-run leaves the step
 * `InProgress` until the stale-step guard reclaims it.
 */
export async function processStockReportLLMResponseInBackground(args: BackgroundStockReportArgs): Promise<void> {
  const { symbol, exchange, reportType, generationRequestId, invocationId, llmProvider, model, prompt, outputSchema } = args;

  try {
    console.log(`[${reportType}] [${symbol}] [${generationRequestId}] Running stock report LLM in background (in-process), skipping lambda`);

    const { result } = await getLLMResponse({
      invocationId,
      llmProvider,
      modelName: model,
      prompt,
      outputSchema,
      maxRetries: 2,
    });

    await saveTickerReportAndAdvanceGeneration({
      exchange,
      ticker: symbol,
      reportType,
      llmResponse: result,
      generationRequestId,
    });

    console.log(`[${reportType}] [${symbol}] [${generationRequestId}] Background stock report saved and next step triggered`);
  } catch (error) {
    console.error(`[${reportType}] [${symbol}] [${generationRequestId}] Background stock report generation failed:`, error);
    await updateInvocationStatus(invocationId, PromptInvocationStatus.Failed, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
