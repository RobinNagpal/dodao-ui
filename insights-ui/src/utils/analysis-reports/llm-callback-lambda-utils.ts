import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GeminiModel, LLMProvider, getDefaultGeminiModel, getDefaultLLMProvider } from '@/types/llmConstants';
import { ReportType } from '@/types/ticker-typesv1';
import {
  compileTemplate,
  createPromptInvocation,
  getLLMResponse,
  LLMResponseViaInvocationRequest,
  loadSchema,
  updateInvocationStatus,
  validateData,
} from '@/util/get-llm-response';
import path from 'path';
import { PromptInvocationStatus } from '@prisma/client';
import { DailyMoverType } from '@/types/daily-mover-constants';

export interface LLMResponseViaLambdaRequest<Input> {
  invocationId: string;
  callbackUrl: string;
  inputJson?: Input;
  promptStringToSendToLLM: string;
  inputSchemaString: string;
  llmProvider: LLMProvider;
  model: GeminiModel;
  outputSchemaString: string;
  additionalData: Record<string, string>;
}

/**
 * Updates the lastInvocationTime and inProgressStep when lambda is actually invoked
 * Only used for ticker V1 generation requests
 */
async function updateLastInvocationTime(generationRequestId: string, reportType: ReportType): Promise<void> {
  console.log('Updating lastInvocationTime and inProgressStep for generationRequestId:', generationRequestId, 'reportType:', reportType);
  await prisma.tickerV1GenerationRequest.update({
    where: {
      id: generationRequestId,
    },
    data: {
      lastInvocationTime: new Date(),
      inProgressStep: reportType,
    },
  });
}

/**
 * Core function to get LLM response
 */
export async function callLambdaForLLMResponseViaCallback<Input>(request: LLMResponseViaLambdaRequest<Input>): Promise<void> {
  const baseUrl = process.env.LAMBDA_URL_LLM_CALL_WITH_CALLBACK || '';
  if (!baseUrl) {
    throw new Error('LAMBDA_URL_LLM_CALL_WITH_CALLBACK environment variable is not set');
  }

  try {
    const postRequest = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    };
    console.log('calling llm lambda');
    const response = await fetch(baseUrl, postRequest);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lambda call failed with status ${response.status}: ${errorText}`);
    }
    console.log('Lambda call succeeded');
  } catch (error) {
    console.error('Error calling lambda:', error);
    throw error;
  }
}

/**
 * Master switch for HOW a stock report's LLM call is run, read from the
 * `USE_LAMBDA_FOR_LLM_RESPONSE` env var (mirrors the tariff side's
 * `USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE` convention):
 *   - `true`        → run the LLM call in-process in the BACKGROUND on this
 *                     server (no AWS Lambda hop). Now safe because we run on a
 *                     long-lived Lightsail server instead of time-limited Vercel.
 *   - unset/`false` → call the AWS Lambda (the original behavior).
 *
 * NOTE: deliberately NOT named `use…` — ESLint's `react-hooks/rules-of-hooks`
 * treats any `use`-prefixed function as a React hook and errors when it's
 * called outside a component/hook.
 */
function isBackgroundLLMGenerationEnabled(): boolean {
  return process.env.USE_LAMBDA_FOR_LLM_RESPONSE === 'true';
}

/**
 * In-process, fire-and-forget equivalent of the AWS Lambda
 * (`lambdas/llm-call-with-callback`): runs the LLM with the SAME invocation row,
 * prompt, provider/model, and output schema the lambda would have received, then
 * POSTs `{ llmResponse, additionalData }` to the SAME `callbackUrl`
 * (`save-report-callback`). That callback persists the report and chains the
 * next step exactly as before — so generation-request, prompt/invocation, and
 * storage logic are all reused untouched; only the execution location changes.
 *
 * The heavy work is detached from the request (`void` at the call site) so the
 * triggering route returns immediately, just like the lambda's instant ack. The
 * `.catch`-equivalent try/catch here is mandatory — an unhandled rejection in a
 * detached promise can take down the Node process.
 *
 * On failure `getLLMResponse` already marks the PromptInvocation `Failed`; we
 * deliberately leave the generation request's `inProgressStep`/`lastInvocationTime`
 * as-is so the existing 5-minute stale-step guard in
 * `triggerGenerationOfAReportSimplified` recovers the step on the next tick.
 *
 * Caveat (same as the tariff background path): an in-process task lives only in
 * this process's memory, so a redeploy/crash mid-run leaves the step
 * `InProgress` until the stale-step guard reclaims it.
 */
export async function processLLMResponseInBackgroundViaCallback<Input>(request: LLMResponseViaLambdaRequest<Input>): Promise<void> {
  const { invocationId, callbackUrl, promptStringToSendToLLM, outputSchemaString, llmProvider, model, additionalData } = request;
  const reportType = additionalData?.reportType || 'unknown';
  const symbol = additionalData?.symbol || 'unknown';
  const generationRequestId = additionalData?.generationRequestId || 'unknown';

  try {
    console.log(`[${reportType}] [${symbol}] [${generationRequestId}] Running LLM in background (in-process), skipping lambda`);

    const { result } = await getLLMResponse({
      invocationId,
      llmProvider,
      modelName: model,
      prompt: promptStringToSendToLLM,
      outputSchema: JSON.parse(outputSchemaString),
      maxRetries: 2,
    });

    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ llmResponse: result, additionalData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Callback POST failed with status ${response.status}: ${errorText}`);
    }
    console.log(`[${reportType}] [${symbol}] [${generationRequestId}] Background LLM response saved via callback`);
  } catch (error) {
    console.error(`[${reportType}] [${symbol}] [${generationRequestId}] Background LLM processing failed:`, error);
  }
}

export interface LLMResponseForPromptViaInvocationViaLambda<Input> {
  symbol: string;
  exchange?: string;
  generationRequestId: string;
  params: LLMResponseViaInvocationRequest<Input>;
  reportType?: ReportType;
  moverType?: DailyMoverType;
}

export async function getLLMResponseForPromptViaInvocationViaLambda<Input>(args: LLMResponseForPromptViaInvocationViaLambda<Input>): Promise<void> {
  const { symbol, exchange, generationRequestId, params, reportType, moverType } = args;
  const { promptKey, llmProvider: providedLlmProvider, model: providedModel, spaceId, inputJson, bodyToAppend, requestFrom } = params;

  // Use provided values or defaults
  const llmProvider = providedLlmProvider || getDefaultLLMProvider();
  const model = providedModel || getDefaultGeminiModel();

  // Validate required fields
  if (!promptKey) {
    throw new Error(`Missing required field: promptKey`);
  }

  // Fetch prompt from database
  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      key: promptKey,
    },
    include: {
      activePromptVersion: true,
    },
  });

  if (!prompt.activePromptVersion) {
    throw new Error(`Active prompt version not found for template ${promptKey}`);
  }

  // Create invocation record
  const invocation = await createPromptInvocation(
    {
      spaceId: spaceId || KoalaGainsSpaceId,
      llmProvider,
      model,
      bodyToAppend,
    },
    {
      promptId: prompt.id,
      promptVersionId: prompt.activePromptVersion.id,
      inputJson,
    }
  );

  try {
    const templateContent = prompt.activePromptVersion.promptTemplate;

    let inputSchemaObject: object | null = null;
    // Validate input against schema if provided
    if (prompt.inputSchema && prompt.inputSchema.trim() !== '') {
      const inputSchemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
      inputSchemaObject = await loadSchema(inputSchemaPath, prompt.inputSchema);
      const { valid, errors } = validateData(inputSchemaObject, inputJson);
      if (!valid) {
        console.error(`Input validation failed: ${JSON.stringify(errors)}`);
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
    }

    if (!inputSchemaObject) {
      throw new Error('Input schema not implemented yet');
    }

    // Compile template
    const finalPrompt = compileTemplate(templateContent, inputJson || {}, bodyToAppend);

    // Update invocation with prompt
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.InProgress, {
      promptRequestToLlm: finalPrompt,
    });

    // Load output schema
    const outputSchemaPath = path.join(process.cwd(), 'schemas', prompt.outputSchema);
    const outputSchema = await loadSchema(outputSchemaPath, prompt.outputSchema);

    // Get LLM response
    const callbackBaseUrl = process.env.REPORT_GENERATION_CALLBACK_BASE_URL || `https://koalagains.com`;

    // Determine callback URL based on whether exchange is provided
    let callbackUrl: string;
    if (exchange) {
      callbackUrl = `${callbackBaseUrl}/api/${spaceId}/tickers-v1/exchange/${exchange}/${symbol}/save-report-callback`;
    } else {
      // For daily movers without exchange
      callbackUrl = `${callbackBaseUrl}/api/${spaceId}/tickers-v1/daily-movers/${generationRequestId}/save-daily-mover`;
    }

    const additionalData: Record<string, string> = {
      generationRequestId: generationRequestId,
    };

    if (reportType) {
      additionalData.reportType = reportType;
    }

    if (moverType) {
      additionalData.moverType = moverType;
    }

    const lambdaRequest: LLMResponseViaLambdaRequest<Input> = {
      invocationId: invocation.id,
      callbackUrl,
      inputJson: inputJson,
      promptStringToSendToLLM: finalPrompt,
      inputSchemaString: JSON.stringify(inputSchemaObject),
      llmProvider: llmProvider,
      model: model,
      outputSchemaString: JSON.stringify(outputSchema),
      additionalData,
    };

    // Background generation is currently limited to stock (ticker V1) report
    // generation, which always carries a `reportType`. Daily movers (no
    // `reportType`) continue to go through the lambda regardless of the flag.
    if (reportType && isBackgroundLLMGenerationEnabled()) {
      // Detach the heavy LLM call from the request so this returns immediately,
      // mirroring the lambda's instant ack. The background task saves via the
      // same callback and chains the next step.
      void processLLMResponseInBackgroundViaCallback<Input>(lambdaRequest);
    } else {
      await callLambdaForLLMResponseViaCallback<Input>(lambdaRequest);
    }

    // Update lastInvocationTime only for ticker V1 generation requests (when reportType is provided)
    if (reportType) {
      console.log(
        `Updating lastInvocationTime and inProgressStep for generationRequestId:${generationRequestId} for reportType: ${reportType} and ticker: ${symbol}`
      );
      await updateLastInvocationTime(generationRequestId, reportType);
    }
  } catch (e) {
    console.error('Error during prompt invocation:', e);
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.Failed, {
      error: (e as Error)?.message,
    });
    throw e;
  }
}
