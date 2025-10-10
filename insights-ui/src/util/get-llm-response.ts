import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { GeminiModel, LLMProvider } from '@/types/llmConstants';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptInvocation, TestPromptInvocation } from '@prisma/client';
import Ajv, { ErrorObject } from 'ajv';
import fs from 'fs';
import Handlebars from 'handlebars';
import jsonpatch from 'jsonpatch';
import path from 'path';
import { PromptInvocationStatus } from '.prisma/client';
import { getGroundedResponse } from './llm-grounding-utils';

// Type definitions
export type RequestSource = 'ui' | 'langflow';

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export interface LLMResponseOptions {
  invocationId: string;
  llmProvider: LLMProvider;
  modelName: GeminiModel;
  prompt: string;
  outputSchema: object;
  maxRetries?: number;
  isTestInvocation?: boolean;
}

export interface LLMResponseViaInvocationRequest<Input> {
  spaceId?: string;
  inputJson?: Input;
  promptKey: string;
  llmProvider: LLMProvider;
  model: GeminiModel;
  bodyToAppend?: string;
  requestFrom: RequestSource;
}

export interface LLMResponseViaTestInvocationRequest {
  spaceId?: string;
  promptId: string;
  promptTemplate: string;
  llmProvider: LLMProvider;
  model: GeminiModel;
  bodyToAppend?: string;
  inputJsonString?: string;
}

export interface TestPromptInvocationResponse<Output> {
  invocationId: string;
  response: Output;
}

export interface LLMResponseObject<Input, Output> {
  request: {
    inputJson?: Input;
  };
  prompt: string;
  response: Output;
  invocationId: string;
}

// Utility functions
/**
 * Validates data against a schema
 */
function validateData(schema: object, data: unknown): ValidationResult {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid: !!valid, errors: validate.errors || [] };
}

/**
 * Initializes an LLM model based on provider and model name
 */
function initializeLLM(provider: LLMProvider, modelName: GeminiModel): BaseChatModel {
  if (provider !== LLMProvider.OPENAI && provider !== LLMProvider.GEMINI && provider !== LLMProvider.GEMINI_WITH_GROUNDING) {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  if (provider === LLMProvider.OPENAI) {
    return new ChatOpenAI({
      model: 'gpt-4o-mini',
    }) as BaseChatModel;
  } else if (provider === LLMProvider.GEMINI || provider === LLMProvider.GEMINI_WITH_GROUNDING) {
    return new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 1,
    });
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

/**
 * Updates the invocation status in the database
 */
async function updateInvocationStatus(
  id: string,
  status: PromptInvocationStatus,
  data: Record<string, unknown>,
  isTestInvocation: boolean = false
): Promise<void> {
  const updateData = {
    ...data,
    status,
    updatedAt: new Date(),
  };

  if (isTestInvocation) {
    await prisma.testPromptInvocation.update({
      where: { id },
      data: updateData,
    });
  } else {
    await prisma.promptInvocation.update({
      where: { id },
      data: updateData,
    });
  }
}

/**
 * Creates a base invocation record with common fields
 */
interface BaseInvocationData {
  spaceId: string;
  llmProvider: LLMProvider;
  model: GeminiModel;
  bodyToAppend?: string;
}

/**
 * Creates a regular prompt invocation record
 * @returns The created prompt invocation record
 */
async function createPromptInvocation<Input>(
  baseData: BaseInvocationData,
  promptData: {
    promptId: string;
    promptVersionId: string;
    inputJson?: Input;
  }
): Promise<PromptInvocation> {
  return prisma.promptInvocation.create({
    data: {
      spaceId: baseData.spaceId,
      promptId: promptData.promptId,
      promptVersionId: promptData.promptVersionId,
      inputJson: promptData.inputJson ? JSON.stringify(promptData.inputJson) : undefined,
      status: PromptInvocationStatus.InProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'unknown',
      updatedBy: 'unknown',
      llmProvider: baseData.llmProvider,
      model: baseData.model,
      bodyToAppend: baseData.bodyToAppend,
    },
  });
}

/**
 * Creates a test prompt invocation record
 * @returns The created test prompt invocation record
 */
async function createTestPromptInvocation(
  baseData: BaseInvocationData,
  testData: {
    promptId: string;
    promptTemplate: string;
    inputData: Record<string, unknown>;
  }
): Promise<TestPromptInvocation> {
  return prisma.testPromptInvocation.create({
    data: {
      spaceId: baseData.spaceId,
      promptId: testData.promptId,
      promptTemplate: testData.promptTemplate,
      inputJson: JSON.stringify(testData.inputData),
      status: PromptInvocationStatus.InProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'unknown',
      updatedBy: 'unknown',
      llmProvider: baseData.llmProvider,
      model: baseData.model,
      bodyToAppend: baseData.bodyToAppend,
    },
  });
}

/**
 * Loads and validates a schema from a file
 */
async function loadSchema(schemaPath: string, schemaName: string): Promise<object> {
  if (!fs.existsSync(schemaPath)) {
    const errorMsg = `Schema file ${schemaName} not found. Path: ${schemaPath}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return await $RefParser.dereference(schemaPath);
}

/**
 * Compiles a template with input data and optional appended body
 */
function compileTemplate(template: string, inputData: Record<string, unknown> = {}, bodyToAppend?: string): string {
  const compiledTemplate = Handlebars.compile(template);
  return bodyToAppend ? `${compiledTemplate(inputData)}\n\n\n${bodyToAppend}` : compiledTemplate(inputData);
}

/**
 * Core function to get LLM response
 */
export async function getLLMResponse<Output>({
  invocationId,
  llmProvider,
  modelName,
  prompt,
  outputSchema,
  maxRetries = 1,
  isTestInvocation,
}: LLMResponseOptions): Promise<Output> {
  let lastResult: unknown | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      let finalPrompt = prompt;

      // Handle Gemini with grounding - two-step process
      if (llmProvider === LLMProvider.GEMINI_WITH_GROUNDING) {
        console.log('Using Gemini with grounding - performing search first...');

        // Step 1: Get grounded response from Gemini with Google Search
        const groundedResponse = await getGroundedResponse(prompt, GeminiModel.GEMINI_2_5_PRO_GROUNDING);

        // Step 2: Convert the grounded response to structured output
        finalPrompt = `Please convert the given information into the given schema format.\n\n${groundedResponse}`;
        console.log('✅ Grounded response obtained, now converting to structured output');
      }

      // Initialize LLM for structured output
      const llm = initializeLLM(llmProvider === LLMProvider.GEMINI_WITH_GROUNDING ? LLMProvider.GEMINI : llmProvider, modelName);
      const structured = llm.withStructuredOutput(outputSchema);

      // Get response from LLM
      const result = (await structured.invoke(finalPrompt)) as Output;
      console.log('Response from llm:', result);
      lastResult = result;

      // Update invocation status
      await updateInvocationStatus(invocationId, PromptInvocationStatus.Completed, { outputJson: JSON.stringify(result) }, isTestInvocation);

      // If test invocation, return early
      if (isTestInvocation) {
        return result;
      }

      // Validate output
      const { valid, errors } = validateData(outputSchema, result);
      if (!valid) {
        console.error('Schema validation errors:', errors);
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }

      return result;
    } catch (err: unknown) {
      const isLast = attempt === maxRetries;
      if (!isLast) {
        console.error(`Attempt ${attempt + 1} failed, retrying…`, err);
        continue;
      }

      if (lastResult !== null) {
        await updateInvocationStatus(invocationId, PromptInvocationStatus.Failed, { outputJson: JSON.stringify(lastResult) }, isTestInvocation);
      } else {
        console.error('Last attempt failed, no result to save.');
        throw new Error(`Unexpected failure in getLLMResponse: ${err instanceof Error ? err.message : String(err)}`);
      }
      throw err;
    }
  }
  console.error('Failed to get LLM response for request', prompt);
  throw new Error('Failed to get LLM response for request' + prompt);
}

/**
 * Gets LLM response via regular invocation
 * @returns The LLM response object, possibly with transformations applied
 */
export async function getLLMResponseForPromptViaInvocation<Input, Output>(
  params: LLMResponseViaInvocationRequest<Input>
): Promise<LLMResponseObject<Input, Output>> {
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

    // Validate input against schema if provided
    if (prompt.inputSchema && prompt.inputSchema.trim() !== '') {
      const inputSchemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
      const inputSchema = await loadSchema(inputSchemaPath, prompt.inputSchema);
      const { valid, errors } = validateData(inputSchema, inputJson);
      if (!valid) {
        console.error(`Input validation failed: ${JSON.stringify(errors)}`);
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
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
    const result = await getLLMResponse<Output>({
      invocationId: invocation.id,
      llmProvider,
      modelName: model,
      prompt: finalPrompt,
      outputSchema,
      maxRetries: 2,
    });

    // Prepare response object
    const originalObject: LLMResponseObject<Input, Output> = {
      request: {
        inputJson,
      },
      prompt: finalPrompt,
      response: result,
      invocationId: invocation.id,
    };

    // Apply transformation patch if available
    if (prompt.transformationPatch) {
      console.log('Applying transformation patch...');
      const patchedObject = jsonpatch.apply_patch(originalObject, prompt.transformationPatch as string);

      await updateInvocationStatus(invocation.id, PromptInvocationStatus.Completed, {
        transformedJson: JSON.stringify(patchedObject),
      });

      if (requestFrom === 'ui') {
        return {
          ...patchedObject,
          invocationId: invocation.id,
        };
      } else {
        return patchedObject;
      }
    }

    return originalObject;
  } catch (e) {
    console.error('Error during prompt invocation:', e);
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.Failed, {
      error: (e as Error)?.message,
    });
    throw e;
  }
}

/**
 * Gets LLM response via test invocation
 */
export async function getLLMResponseForPromptViaTestInvocation<Output>(
  params: LLMResponseViaTestInvocationRequest
): Promise<TestPromptInvocationResponse<Output>> {
  console.log('getLLMResponseForPromptViaTestInvocation', JSON.stringify(params, null, 2));
  const { promptId, promptTemplate, llmProvider, model, spaceId, bodyToAppend, inputJsonString } = params;

  // Validate required fields
  if (!promptId || !promptTemplate || !llmProvider || !model) {
    throw new Error(`Missing required fields: promptId, promptTemplate, llmProvider, or model`);
  }

  // Parse input data
  const inputData = inputJsonString ? JSON.parse(inputJsonString) : {};

  // Fetch prompt from database
  const dbPrompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      id: promptId,
    },
  });

  // Create test invocation record
  const invocation = await createTestPromptInvocation(
    {
      spaceId: spaceId || KoalaGainsSpaceId,
      llmProvider,
      model,
      bodyToAppend,
    },
    {
      promptId,
      promptTemplate,
      inputData,
    }
  );

  try {
    // Validate input against schema if provided
    if (dbPrompt.inputSchema && dbPrompt.inputSchema.trim() !== '') {
      const inputSchemaPath = path.join(process.cwd(), 'schemas', dbPrompt.inputSchema);
      const inputSchema = await loadSchema(inputSchemaPath, dbPrompt.inputSchema);
      const { valid, errors } = validateData(inputSchema, inputData);
      if (!valid) {
        console.error(`Input validation failed: ${JSON.stringify(errors)}`);
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
    }

    // Compile template
    const finalPrompt = compileTemplate(promptTemplate, inputData, bodyToAppend);

    // Load output schema
    const outputSchemaPath = path.join(process.cwd(), 'schemas', dbPrompt.outputSchema);
    const outputSchema = await loadSchema(outputSchemaPath, dbPrompt.outputSchema);

    // Get LLM response
    const result = await getLLMResponse<Output>({
      invocationId: invocation.id,
      llmProvider,
      modelName: model,
      prompt: finalPrompt,
      outputSchema,
      maxRetries: 2,
      isTestInvocation: true,
    });

    // Validate output
    const { valid: validOutput, errors: outputErrors } = validateData(outputSchema, result);
    if (!validOutput) {
      throw new Error(`Output validation failed: ${JSON.stringify(outputErrors)}`);
    }

    // Prepare response
    const originalResponse: TestPromptInvocationResponse<Output> = {
      invocationId: invocation.id,
      response: result,
    };

    // Apply transformation patch if available
    if (dbPrompt.transformationPatch) {
      const patchedResponse = jsonpatch.apply_patch(originalResponse, dbPrompt.transformationPatch as string);
      await updateInvocationStatus(
        invocation.id,
        PromptInvocationStatus.Completed,
        {
          transformedJson: JSON.stringify(patchedResponse),
        },
        true
      );

      return {
        ...patchedResponse,
      };
    }

    return originalResponse;
  } catch (e) {
    console.error('Error during prompt invocation:', e);
    await updateInvocationStatus(
      invocation.id,
      PromptInvocationStatus.Failed,
      {
        error: (e as Error)?.message,
      },
      true
    );

    throw e;
  }
}
