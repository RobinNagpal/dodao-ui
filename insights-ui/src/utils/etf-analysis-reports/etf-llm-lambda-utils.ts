import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import { getDefaultGeminiModel, getDefaultLLMProvider } from '@/types/llmConstants';
import { compileTemplate, createPromptInvocation, loadSchema, updateInvocationStatus, validateData } from '@/util/get-llm-response';
import { callLambdaForLLMResponseViaCallback, LLMResponseViaLambdaRequest } from '@/utils/analysis-reports/llm-callback-lambda-utils';
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
    const templateContent = prompt.activePromptVersion.promptTemplate;

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

    const outputSchemaPath = path.join(process.cwd(), 'schemas', prompt.outputSchema);
    const outputSchema = await loadSchema(outputSchemaPath, prompt.outputSchema);

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

    await callLambdaForLLMResponseViaCallback(lambdaRequest);

    await updateEtfLastInvocationTime(generationRequestId, reportType);
  } catch (e) {
    console.error('Error during ETF prompt invocation:', e);
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.Failed, {
      error: (e as Error)?.message,
    });
    throw e;
  }
}
