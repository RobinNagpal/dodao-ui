import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { ChatOpenAI } from '@langchain/openai';
import Ajv, { ErrorObject } from 'ajv';
import fs from 'fs';
import Handlebars from 'handlebars';
import jsonpatch from 'jsonpatch';
import { NextRequest } from 'next/server';
import path from 'path';
import { PromptInvocationStatus } from '.prisma/client';

export interface PromptInvocationRequest {
  spaceId?: string;
  inputJson?: Record<string, unknown>;
  promptKey: string;
  llmProvider: string;
  model: string;
  bodyToAppend?: string;
  requestFrom: 'ui' | 'langflow';
}

export interface PromptInvocationResponse {
  request: PromptInvocationRequest;
  prompt: string;
  response: Record<string, unknown>;
  invocationId: string;
}
async function postHandler(req: NextRequest): Promise<any> {
  const request = await req.json();
  const { promptKey, llmProvider, model, bodyToAppend, requestFrom = 'ui' } = request as PromptInvocationRequest;

  // Default inputJson to an empty object if it is not attached
  const inputJson = request.inputJson;

  if (!req.body) {
    throw new Error(`Request body is missing`);
  }

  // Ensure required fields are present.
  if (!promptKey || !llmProvider || !model) {
    throw new Error(`Missing required fields: input, templateId, llmProvider, or model`);
  }

  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: request.spaceId || KoalaGainsSpaceId,
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

    // Choose LLM based on llmProvider. Currently, only "openai" is supported.
    let llm: ChatOpenAI | undefined;
    if (llmProvider.toLowerCase() === 'openai') {
      llm = new ChatOpenAI({ model: model });
    } else {
      throw new Error(`Unsupported llmProvider: ${llmProvider}`);
    }

    const outputSchemaPath = path.join(process.cwd(), 'schemas', prompt.outputSchema);
    if (!fs.existsSync(outputSchemaPath)) {
      throw new Error(`Output schema file ${prompt.outputSchema} not found`);
    }

    const outputSchema = await $RefParser.dereference(outputSchemaPath);

    const modelWithStructure = llm.withStructuredOutput(outputSchema);
    const result = await modelWithStructure.invoke(finalPrompt);
    console.log(`Result: ${JSON.stringify(result)}`);
    if (result) {
      await prisma.promptInvocation.update({
        where: {
          id: invocation.id,
        },
        data: {
          outputJson: JSON.stringify(result),
          updatedAt: new Date(),
          status: PromptInvocationStatus.Completed,
        },
      });
    }
    const { valid: validOutput, errors: outputErrors } = validateData(outputSchema, result);

    if (!validOutput) {
      throw new Error(`Output validation failed: ${JSON.stringify(outputErrors)}`);
    }

    const originalObject = {
      request: request,
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
      where: {
        id: invocation.id,
      },
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

function removeNullBytes(str: string) {
  return str.replace(/\0/g, '');
}

export const POST = withErrorHandlingV2<any>(postHandler);
