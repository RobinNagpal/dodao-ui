import { prisma } from "@/prisma";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptInvocation, PromptInvocationStatus } from "@prisma/client";
import Ajv, { ErrorObject } from "ajv";

import {
  GeminiModel,
  KoalaGainsSpaceId,
  LLMProvider,
} from "./koalaGainsConstants";
import { getGroundedResponse } from "./llm-grounding-utils";

export interface ValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export interface LLMResponseOptions {
  invocationId: string;
  llmProvider: LLMProvider;
  modelName: GeminiModel;
  promptString: string;
  outputSchemaString: string;
  maxRetries?: number;
  isTestInvocation?: boolean;
  additionalData?: Record<string, string>;
}

export interface LLMResponseViaLambda<Input> {
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
 * Validates data against a schema
 */
function validateData(schema: string, data: unknown): ValidationResult {
  const ajv = new Ajv();
  const validate = ajv.compile(JSON.parse(schema));
  const valid = validate(data);
  return { valid: !!valid, errors: validate.errors || [] };
}

/**
 * Initializes an LLM model based on provider and model name
 */
function initializeLLM(
  provider: LLMProvider,
  modelName: GeminiModel
): BaseChatModel {
  if (
    provider !== LLMProvider.OPENAI &&
    provider !== LLMProvider.GEMINI &&
    provider !== LLMProvider.GEMINI_WITH_GROUNDING
  ) {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }

  if (provider === LLMProvider.OPENAI) {
    return new ChatOpenAI({
      model: "gpt-4o-mini",
    }) as BaseChatModel;
  } else if (
    provider === LLMProvider.GEMINI ||
    provider === LLMProvider.GEMINI_WITH_GROUNDING
  ) {
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

  await prisma.promptInvocation.update({
    where: { id },
    data: updateData,
  });
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
      inputJson: promptData.inputJson
        ? JSON.stringify(promptData.inputJson)
        : undefined,
      status: PromptInvocationStatus.InProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "unknown",
      updatedBy: "unknown",
      llmProvider: baseData.llmProvider,
      model: baseData.model,
      bodyToAppend: baseData.bodyToAppend,
    },
  });
}

/**
 * Core function to get LLM response
 */
export async function getLLMResponse<Output>({
  invocationId,
  llmProvider,
  modelName,
  promptString,
  outputSchemaString,
  maxRetries = 1,
  isTestInvocation,
  additionalData,
}: LLMResponseOptions): Promise<Output> {
  let lastResult: unknown | null = null;
  const reportType = additionalData?.reportType || "unknown";
  const symbol = additionalData?.symbol || "unknown";
  const generationId = additionalData?.generationRequestId || "unknown";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      let finalPrompt = promptString;

      // Handle Gemini with grounding - two-step process
      if (llmProvider === LLMProvider.GEMINI_WITH_GROUNDING) {
        console.log(
          `[${reportType}] [${symbol}] [${generationId}] Using Gemini with grounding - performing search first...`
        );

        // Step 1: Get grounded response from Gemini with Google Search
        const groundedResponse = await getGroundedResponse(
          promptString,
          GeminiModel.GEMINI_2_5_PRO_GROUNDING
        );

        // Step 2: Convert the grounded response to structured output
        finalPrompt = `Please convert the given information into the given schema format.\n\n${groundedResponse}`;

        console.log(
          `[${reportType}] [${symbol}] [${generationId}] ✅ Grounded response obtained, now converting to structured output`
        );
      }

      // Initialize LLM for structured output
      const llm = initializeLLM(
        llmProvider === LLMProvider.GEMINI_WITH_GROUNDING
          ? LLMProvider.GEMINI
          : llmProvider,
        modelName
      );
      const structured = llm.withStructuredOutput(
        JSON.parse(outputSchemaString)
      );

      // Get response from LLM
      const result = (await structured.invoke(finalPrompt)) as Output;

      console.log(
        `[${reportType}] [${symbol}] [${generationId}] Response from llm:`,
        result
      );
      lastResult = result;

      // Update invocation status
      await updateInvocationStatus(
        invocationId,
        PromptInvocationStatus.Completed,
        { outputJson: JSON.stringify(result) },
        isTestInvocation
      );

      // If test invocation, return early
      if (isTestInvocation) {
        return result;
      }

      // Validate output
      const { valid, errors } = validateData(outputSchemaString, result);
      if (!valid) {
        console.error(
          `[${reportType}] [${symbol}] [${generationId}] Schema validation errors:`,
          errors
        );
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }

      return result;
    } catch (err: unknown) {
      const isLast = attempt === maxRetries;
      if (!isLast) {
        console.error(
          `[${reportType}] [${symbol}] [${generationId}] Attempt ${
            attempt + 1
          } failed, retrying…`,
          err
        );
        continue;
      }

      if (lastResult !== null) {
        await updateInvocationStatus(
          invocationId,
          PromptInvocationStatus.Failed,
          { outputJson: JSON.stringify(lastResult) },
          isTestInvocation
        );
      } else {
        console.error(
          `[${reportType}] [${symbol}] [${generationId}] Last attempt failed, no result to save.`
        );
        throw new Error(
          `Unexpected failure in getLLMResponse: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
      throw err;
    }
  }
  console.error(
    `[${reportType}] [${symbol}] [${generationId}] Failed to get LLM response for request`,
    prompt
  );
  throw new Error("Failed to get LLM response for request" + prompt);
}

/**
 * Gets LLM response via regular invocation
 * @returns The LLM response object, possibly with transformations applied
 */
export async function getLLMResponseInLamnda<Input, Output>(
  params: LLMResponseViaLambda<Input>
): Promise<Output> {
  const {
    promptStringToSendToLLM,
    llmProvider,
    model,
    inputSchemaString,
    outputSchemaString,
    inputJson,
  } = params;

  // Create invocation record
  const invocation = await prisma.promptInvocation.findFirstOrThrow({
    where: {
      id: params.invocationId,
    },
  });

  try {
    const { valid, errors } = validateData(inputSchemaString, inputJson);
    if (!valid) {
      console.error(`Input validation failed: ${JSON.stringify(errors)}`);
      throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
    }

    // Get LLM response
    const result = await getLLMResponse<Output>({
      invocationId: invocation.id,
      llmProvider,
      modelName: model,
      promptString: promptStringToSendToLLM,
      outputSchemaString: outputSchemaString,
      maxRetries: 2,
      additionalData: params.additionalData,
    });

    return result;
  } catch (e) {
    const reportType = params.additionalData?.reportType || "unknown";
    const symbol = params.additionalData?.symbol || "unknown";
    const generationId =
      params.additionalData?.generationRequestId || "unknown";
    console.error(
      `[${reportType}] [${symbol}] [${generationId}] Error during prompt invocation:`,
      e
    );
    await updateInvocationStatus(invocation.id, PromptInvocationStatus.Failed, {
      error: (e as Error)?.message,
    });
    throw e;
  }
}
