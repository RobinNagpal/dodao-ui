import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { saveEtfReportAndAdvanceGeneration } from '@/utils/etf-analysis-reports/save-etf-report-callback-utils';
import { getLLMResponse } from '@/util/get-llm-response';

export interface BackgroundEtfReportArgs {
  symbol: string;
  exchange: string;
  reportType: EtfReportType;
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
 * (`lambdas/llm-call-with-callback`) for ETF report generation.
 *
 * It does exactly what the lambda + callback did, just in this process:
 *  1. Run the LLM via the same `getLLMResponse` core runner, with the same
 *     invocation row / prompt / provider / model / output schema the lambda
 *     would have received.
 *  2. Persist the report and advance the generation request by calling
 *     `saveEtfReportAndAdvanceGeneration` DIRECTLY — the same function the ETF
 *     `save-report-callback` route runs — instead of POSTing back to that route
 *     over HTTP. So storage, `completedSteps`, and the next-step trigger are
 *     byte-for-byte the same; only the call mechanism changes (a function call
 *     instead of a network round-trip).
 *
 * Call this detached (`void`) so the triggering request returns immediately,
 * mirroring the lambda's instant ack. The try/catch is mandatory: an unhandled
 * rejection in a detached promise can take down the Node process. On failure
 * `getLLMResponse` has already marked the PromptInvocation `Failed`; we
 * deliberately leave the generation request's `inProgressStep` /
 * `lastInvocationTime` untouched so the 5-minute stale-step guard in
 * `triggerEtfGenerationOfAReport` reclaims the step on the next tick.
 *
 * Caveat (same as the stock/tariff background paths): an in-process task lives
 * only in this process's memory, so a redeploy/crash mid-run leaves the step
 * `InProgress` until the stale-step guard reclaims it.
 */
export async function processEtfReportLLMResponseInBackground(args: BackgroundEtfReportArgs): Promise<void> {
  const { symbol, exchange, reportType, generationRequestId, invocationId, llmProvider, model, prompt, outputSchema } = args;

  try {
    console.log(`[${reportType}] [${symbol}] [${generationRequestId}] Running ETF report LLM in background (in-process), skipping lambda`);

    const { result } = await getLLMResponse({
      invocationId,
      llmProvider,
      modelName: model,
      prompt,
      outputSchema,
      maxRetries: 2,
    });

    await saveEtfReportAndAdvanceGeneration({
      exchange,
      etf: symbol,
      reportType,
      llmResponse: result,
      generationRequestId,
    });

    console.log(`[${reportType}] [${symbol}] [${generationRequestId}] Background ETF report saved and next step triggered`);
  } catch (error) {
    console.error(`[${reportType}] [${symbol}] [${generationRequestId}] Background ETF report generation failed:`, error);
  }
}
