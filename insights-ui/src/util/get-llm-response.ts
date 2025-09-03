import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import Ajv, { ErrorObject } from 'ajv';
import fs from 'fs';
import Handlebars from 'handlebars';
import jsonpatch from 'jsonpatch';
import path from 'path';
import { PromptInvocationStatus } from '.prisma/client';

// @ts-ignore
const OpenAIChat = ChatOpenAI;

interface GetLLMResponseOpts {
  invocationId: string;
  llmProvider: 'openai' | 'gemini';
  modelName: string;
  prompt: string;
  outputSchema: object;
  maxRetries?: number;
}

export async function getLLMResponse({ invocationId, llmProvider, modelName, prompt, outputSchema, maxRetries = 1 }: GetLLMResponseOpts): Promise<unknown> {
  const ajv = new Ajv();
  const validate = ajv.compile(outputSchema);

  let lastResult: unknown | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (llmProvider.toLowerCase() !== 'openai' && llmProvider.toLowerCase() !== 'gemini') {
        throw new Error(`Unsupported llmProvider: ${llmProvider}`);
      }
      let llm: BaseChatModel;
      if (llmProvider === 'openai') {
        llm = new OpenAIChat({
          model: modelName,
        }) as BaseChatModel;
      } else {
        llm = new ChatGoogleGenerativeAI({
          model: modelName,
          apiKey: process.env.GOOGLE_API_KEY,
          temperature: 1,
        });
      }

      const structured = llm.withStructuredOutput(outputSchema);

      const result = await structured.invoke(prompt);
      lastResult = result;

      await prisma.promptInvocation.update({
        where: { id: invocationId },
        data: {
          outputJson: JSON.stringify(result),
          status: PromptInvocationStatus.Completed,
          updatedAt: new Date(),
        },
      });

      const valid = validate(result);
      if (!valid) {
        console.error('Schema validation errors:', validate.errors);
        throw new Error(`Validation failed: ${JSON.stringify(validate.errors)}`);
      }

      return result;
    } catch (err: any) {
      const isLast = attempt === maxRetries;
      if (!isLast) {
        console.warn(`Attempt ${attempt + 1} failed, retrying…`, err);
        continue;
      }

      if (lastResult !== null) {
        await prisma.promptInvocation.update({
          where: { id: invocationId },
          data: {
            outputJson: JSON.stringify(lastResult),
            status: PromptInvocationStatus.Failed,
            updatedAt: new Date(),
          },
        });
      } else {
        throw new Error(`Unexpected failure in getLLMResponse: ${err instanceof Error ? err.message : String(err)}`);
      }
      throw err;
    }
  }
}

export interface GetLLMResponseViaInvocationRequest {
  spaceId?: string;
  inputJson?: Record<string, unknown>;
  promptKey: string;
  llmProvider: 'openai' | 'gemini';
  model: string;
  bodyToAppend?: string;
  requestFrom: 'ui' | 'langflow';
}

export async function getLLMResponseForPromptViaInvocation(params: GetLLMResponseViaInvocationRequest) {
  const { promptKey, llmProvider, model, spaceId, inputJson, bodyToAppend, requestFrom } = params;

  // Ensure required fields are present.
  if (!promptKey || !llmProvider || !model) {
    throw new Error(`Missing required fields: input, templateId, llmProvider, or model`);
  }

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

  const invocation = await prisma.promptInvocation.create({
    data: {
      spaceId: KoalaGainsSpaceId,
      inputJson: inputJson ? JSON.stringify(inputJson) : undefined,
      promptId: prompt.id,
      promptVersionId: prompt.activePromptVersion.id,
      status: PromptInvocationStatus.InProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'unknown',
      updatedBy: 'unknown',
      llmProvider: llmProvider,
      model: model,
      bodyToAppend: bodyToAppend,
    },
  });

  try {
    const templateContent = prompt.activePromptVersion.promptTemplate;

    if (prompt.inputSchema && prompt.inputSchema.trim() !== '') {
      const inputSchemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
      if (!fs.existsSync(inputSchemaPath)) {
        throw new Error(`Input schema file ${prompt.inputSchema} not found. Path ${inputSchemaPath}`);
      }
      const inputSchema = await $RefParser.dereference(inputSchemaPath);
      const { valid, errors } = validateData(inputSchema, inputJson);
      if (!valid) {
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
    }

    // Compile the Handlebars template with the provided input.
    const compiledTemplate = Handlebars.compile(templateContent);
    const finalPrompt = bodyToAppend ? `${compiledTemplate(inputJson || {})}\n\n\n${bodyToAppend}` : compiledTemplate(inputJson || {});

    await prisma.promptInvocation.update({
      where: {
        id: invocation.id,
      },
      data: {
        promptRequestToLlm: finalPrompt,
        updatedAt: new Date(),
      },
    });

    const outputSchemaPath = path.join(process.cwd(), 'schemas', prompt.outputSchema);
    if (!fs.existsSync(outputSchemaPath)) {
      throw new Error(`Output schema file ${prompt.outputSchema} not found`);
    }

    const outputSchema = await $RefParser.dereference(outputSchemaPath);

    const result = await getLLMResponse({
      invocationId: invocation.id,
      llmProvider,
      modelName: model,
      prompt: finalPrompt,
      outputSchema,
      maxRetries: 2,
    });

    const originalObject = {
      request: {
        inputJson,
      },
      prompt: finalPrompt,
      response: result,
      invocationId: invocation.id,
    };

    if (prompt.transformationPatch) {
      const patchedObject = jsonpatch.apply_patch(originalObject, prompt.transformationPatch as any[]);

      await prisma.promptInvocation.update({
        where: {
          id: invocation.id,
        },
        data: {
          transformedJson: JSON.stringify(patchedObject),
          updatedAt: new Date(),
          status: PromptInvocationStatus.Completed,
        },
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
  } catch (e) {
    await prisma.promptInvocation.update({
      where: { id: invocation.id },
      data: {
        status: PromptInvocationStatus.Failed,
        error: (e as any)?.message,
        updatedAt: new Date(),
      },
    });
    throw e;
  }
}

function validateData(schema: object, data: unknown): { valid: boolean; errors?: ErrorObject[] } {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid: !!valid, errors: validate.errors || [] };
}
