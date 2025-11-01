import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import { ReportType } from '@/types/ticker-typesv1';
import {
  compileTemplate,
  createPromptInvocation,
  LLMResponseViaInvocationRequest,
  loadSchema,
  updateInvocationStatus,
  validateData,
} from '@/util/get-llm-response';
import path from 'path';
import { PromptInvocationStatus } from '.prisma/client';

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
 * Core function to get LLM response
 */
export async function callLambdaForLLMResponseViaCallback<Input>(request: LLMResponseViaLambdaRequest<Input>): Promise<void> {
  // TODO: Make a rest call to lambda which will get results from LLM and invoke callback
}

export async function getLLMResponseForPromptViaInvocationViaLambda<Input, Output>(
  params: LLMResponseViaInvocationRequest<Input>,
  reportType: ReportType
): Promise<void> {
  const { promptKey, llmProvider, model, spaceId, inputJson, bodyToAppend, requestFrom } = params;

  // Validate required fields
  if (!promptKey || !llmProvider || !model) {
    throw new Error(`Missing required fields: promptKey, llmProvider, or model`);
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

    if (!!inputSchemaObject) {
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
    const lambdaRequest: LLMResponseViaLambdaRequest<Input> = {
      invocationId: invocation.id,
      callbackUrl: 'https://koalagains.com/api/' + reportType,
      inputJson: inputJson,
      promptStringToSendToLLM: finalPrompt,
      inputSchemaString: JSON.stringify(inputSchemaObject),
      llmProvider: llmProvider,
      model: model,
      outputSchemaString: JSON.stringify(outputSchema),
      additionalData: {
        reportType: reportType,
      },
    };
    await callLambdaForLLMResponseViaCallback<Input>(lambdaRequest);
  } catch (e) {
    console.error('Error during prompt invocation:', e);
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.Failed, {
      error: (e as Error)?.message,
    });
    throw e;
  }
}
