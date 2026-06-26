import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { getDefaultGeminiModel, getDefaultLLMProvider } from '@/types/llmConstants';
import { compileTemplate, createPromptInvocation, loadSchema, updateInvocationStatus, validateData } from '@/util/get-llm-response';
import { callLambdaForLLMResponseViaCallback, LLMResponseViaLambdaRequest } from '@/utils/analysis-reports/llm-callback-lambda-utils';
import { processEtfReportLLMResponseInBackground } from '@/utils/etf-analysis-reports/background-etf-llm-generation-utils';
import { resolveEtfOutputSchema, resolveEtfPromptTemplate } from '@/utils/etf-analysis-reports/etf-prompt-template-utils';
import path from 'path';
import { PromptInvocationStatus } from '@prisma/client';

export interface EtfLLMRequest {
  symbol: string;
  exchange: string;
  generationRequestId: string;
  inputJson: Record<string, unknown>;
  promptKey: string;
  spaceId: string;
  reportType: EtfReportType;
}

/**
 * Master switch for HOW an ETF report's LLM call is run, read from the
 * `USE_LAMBDA_FOR_LLM_RESPONSE` env var (the SAME flag the stock path uses, and
 * mirroring the tariff side's `USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE` convention):
 *   - `true`        → run the LLM call in-process in the BACKGROUND on this
 *                     server (no AWS Lambda hop). Now safe because we run on a
 *                     long-lived AWS server instead of time-limited Vercel.
 *   - unset/`false` → call the AWS Lambda (the original behavior).
 *
 * The generation-request workflow is untouched either way — both paths create
 * the same invocation, save via the same `saveEtfReportAndAdvanceGeneration`
 * function, and chain the next step the same way; only the LLM-call mechanism
 * differs.
 *
 * NOTE: deliberately NOT named `use…` — ESLint's `react-hooks/rules-of-hooks`
 * treats any `use`-prefixed function as a React hook and errors when it's
 * called outside a component/hook.
 */
function isBackgroundLLMGenerationEnabled(): boolean {
  return process.env.USE_LAMBDA_FOR_LLM_RESPONSE === 'true';
}

async function updateEtfLastInvocationTime(generationRequestId: string, reportType: EtfReportType): Promise<void> {
  await prisma.etfGenerationRequest.update({
    where: { id: generationRequestId },
    data: {
      lastInvocationTime: new Date(),
      inProgressStep: reportType,
    },
  });
}

export async function callEtfLambdaForLLMResponse(args: EtfLLMRequest): Promise<void> {
  const { symbol, exchange, generationRequestId, inputJson, promptKey, spaceId, reportType } = args;

  const llmProvider = getDefaultLLMProvider();
  const model = getDefaultGeminiModel();

  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      key: promptKey,
    },
    include: { activePromptVersion: true },
  });

  if (!prompt.activePromptVersion) {
    throw new Error(`Active prompt version not found for template ${promptKey}`);
  }

  const invocation = await createPromptInvocation(
    { spaceId: spaceId || KoalaGainsSpaceId, llmProvider, model },
    { promptId: prompt.id, promptVersionId: prompt.activePromptVersion.id, inputJson }
  );

  try {
    const templateContent = resolveEtfPromptTemplate(reportType, prompt.activePromptVersion.promptTemplate);

    let inputSchemaObject: object | null = null;
    if (prompt.inputSchema && prompt.inputSchema.trim() !== '') {
      const inputSchemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
      inputSchemaObject = await loadSchema(inputSchemaPath, prompt.inputSchema);
      const { valid, errors } = validateData(inputSchemaObject, inputJson);
      if (!valid) {
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
    }

    if (!inputSchemaObject) {
      throw new Error('Input schema not found for ETF prompt');
    }

    const finalPrompt = compileTemplate(templateContent, inputJson || {});

    await updateInvocationStatus(invocation.id, PromptInvocationStatus.InProgress, {
      promptRequestToLlm: finalPrompt,
    });

    const outputSchemaName = resolveEtfOutputSchema(reportType, prompt.outputSchema);
    const outputSchemaPath = path.join(process.cwd(), 'schemas', outputSchemaName);
    const outputSchema = await loadSchema(outputSchemaPath, outputSchemaName);

    const callbackBaseUrl = process.env.REPORT_GENERATION_CALLBACK_BASE_URL || 'https://koalagains.com';
    const callbackUrl = `${callbackBaseUrl}/api/${spaceId}/etfs-v1/exchange/${exchange}/${symbol}/save-report-callback`;

    const lambdaRequest: LLMResponseViaLambdaRequest<Record<string, unknown>> = {
      invocationId: invocation.id,
      callbackUrl,
      inputJson,
      promptStringToSendToLLM: finalPrompt,
      inputSchemaString: JSON.stringify(inputSchemaObject),
      llmProvider,
      model,
      outputSchemaString: JSON.stringify(outputSchema),
      additionalData: {
        generationRequestId,
        reportType,
      },
    };

    if (isBackgroundLLMGenerationEnabled()) {
      // Detach the heavy LLM call from the request so this returns immediately,
      // mirroring the lambda's instant ack. The background task runs the LLM
      // in-process and then saves + chains the next step directly (no callback
      // round-trip).
      void processEtfReportLLMResponseInBackground({
        symbol,
        exchange,
        reportType,
        generationRequestId,
        invocationId: invocation.id,
        llmProvider,
        model,
        prompt: finalPrompt,
        outputSchema,
      });
    } else {
      await callLambdaForLLMResponseViaCallback(lambdaRequest);
    }

    await updateEtfLastInvocationTime(generationRequestId, reportType);
  } catch (e) {
    console.error('Error during ETF prompt invocation:', e);
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.Failed, {
      error: (e as Error)?.message,
    });
    throw e;
  }
}
