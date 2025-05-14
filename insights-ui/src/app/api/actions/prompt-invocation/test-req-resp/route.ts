import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import Ajv, { ErrorObject } from 'ajv';
import Handlebars from 'handlebars';
import jsonpatch from 'jsonpatch';
import { ChatOpenAI } from '@langchain/openai';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { PromptInvocationStatus } from '.prisma/client';
import { error } from 'console';

export interface TestPromptInvocationRequest {
  spaceId?: string;
  promptTemplate: string;
  promptId: string;
  inputJsonString?: string;
  llmProvider: string;
  model: string;
  bodyToAppend?: string;
}

export interface TestPromptInvocationResponse {
  response: Record<string, unknown>;
}

async function postHandler(req: NextRequest): Promise<TestPromptInvocationResponse> {
  const request = (await req.json()) as TestPromptInvocationRequest;
  const { spaceId, promptTemplate, promptId, llmProvider, model, bodyToAppend, inputJsonString } = request;

  // Ensure required fields are present.
  if (!promptId || !promptTemplate || !llmProvider || !model) {
    throw new Error('Missing required fields');
  }

  // Set inputJson to an empty object if not provided.
  const inputData = inputJsonString ? JSON.parse(inputJsonString) : {};

  const dbPrompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      id: promptId,
    },
  });

  const invocation = await prisma.testPromptInvocation.create({
    data: {
      spaceId: spaceId || KoalaGainsSpaceId,
      promptId: promptId,
      promptTemplate: promptTemplate,
      inputJson: JSON.stringify(inputData),
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
    // If an input schema is defined, validate the input JSON.
    if (dbPrompt.inputSchema && dbPrompt.inputSchema.trim() !== '') {
      const inputSchemaPath = path.join(process.cwd(), 'schemas', dbPrompt.inputSchema);
      if (!fs.existsSync(inputSchemaPath)) {
        throw new Error(`Input schema file ${dbPrompt.inputSchema} not found. Path: ${inputSchemaPath}`);
      }
      const inputSchema = await $RefParser.dereference(inputSchemaPath);
      const { valid, errors } = validateData(inputSchema, inputData);
      if (!valid) {
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
    }

    // Compile the user-edited prompt using Handlebars.
    const compiledTemplate = Handlebars.compile(promptTemplate);
    const finalPrompt = bodyToAppend ? `${compiledTemplate(inputData)}\n\n\n${bodyToAppend}` : compiledTemplate(inputData);

    // Build the output schema.
    const outputSchemaPath = path.join(process.cwd(), 'schemas', dbPrompt.outputSchema);
    if (!fs.existsSync(outputSchemaPath)) {
      throw new Error(`Output schema file ${dbPrompt.outputSchema} not found. Path: ${outputSchemaPath}`);
    }
    const outputSchema = await $RefParser.dereference(outputSchemaPath);

    // Choose the LLM provider. (Currently only 'openai' is supported.)
    let llm: ChatOpenAI;
    if (llmProvider.toLowerCase() === 'openai') {
      llm = new ChatOpenAI({ model });
    } else {
      throw new Error(`Unsupported llmProvider: ${llmProvider}`);
    }

    // Prepare the language model call with structured output.
    const modelWithStructure = llm.withStructuredOutput(outputSchema);
    const result = await modelWithStructure.invoke(finalPrompt);
    console.log(`Result: ${JSON.stringify(result)}`);

    // Update the test invocation record with the output.
    await prisma.testPromptInvocation.update({
      where: { id: invocation.id },
      data: {
        outputJson: JSON.stringify(result),
        updatedAt: new Date(),
        status: PromptInvocationStatus.Completed,
      },
    });

    // Validate the output against the output schema.
    const { valid: validOutput, errors: outputErrors } = validateData(outputSchema, result);
    if (!validOutput) {
      throw new Error(`Output validation failed: ${JSON.stringify(outputErrors)}`);
    }

    const originalResponse = {
      request: request,
      prompt: finalPrompt,
      response: result,
      invocationId: invocation.id,
    };

    // If the prompt record contains a transformation patch, apply it.
    if (dbPrompt.transformationPatch) {
      const patchedResponse = jsonpatch.apply_patch(originalResponse, dbPrompt.transformationPatch as any[]);
      await prisma.testPromptInvocation.update({
        where: { id: invocation.id },
        data: {
          transformedJson: JSON.stringify(patchedResponse),
          updatedAt: new Date(),
          status: PromptInvocationStatus.Completed,
        },
      });
      return {
        ...patchedResponse,
      };
    }

    return originalResponse;
  } catch (e) {
    // Update the invocation record to reflect a failure.
    await prisma.testPromptInvocation.update({
      where: { id: invocation.id },
      data: {
        status: PromptInvocationStatus.Failed,
        error: (e as Error)?.message,
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

export const POST = withErrorHandlingV2<TestPromptInvocationResponse>(postHandler);
