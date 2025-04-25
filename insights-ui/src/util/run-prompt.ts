import { PromptInvocationStatus } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { prisma } from '@/prisma';
import path from 'path';
import fs from 'fs';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import Handlebars from 'handlebars';
import Ajv, { ErrorObject } from 'ajv';
import { gpt4OSearchModel } from '@/scripts/industry-tariff-reports/llm-utils';

export async function invokePrompt(promptKey: string, input?: any): Promise<string> {
  const prompt = await prisma.prompt.findFirstOrThrow({
    where: { spaceId: KoalaGainsSpaceId, key: promptKey },
    include: { activePromptVersion: true },
  });
  if (!prompt.activePromptVersion) {
    throw new Error(`No activePromptVersion for ${promptKey}`);
  }

  // 2. Start invocation record
  const invocation = await prisma.promptInvocation.create({
    data: {
      spaceId: KoalaGainsSpaceId,
      inputJson: JSON.stringify(input ?? {}),
      promptId: prompt.id,
      promptVersionId: prompt.activePromptVersion.id,
      status: PromptInvocationStatus.InProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'unknown',
      updatedBy: 'unknown',
      llmProvider: 'openai',
      model: gpt4OSearchModel.model,
    },
  });

  try {
    // 3. If an inputSchema exists, input must be provided and valid
    if (prompt.inputSchema?.trim()) {
      if (!input) {
        throw new Error(`Prompt "${promptKey}" requires input, but none was provided.`);
      }
      const schemaPath = path.join(process.cwd(), 'schemas', prompt.inputSchema);
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Input schema file not found at ${schemaPath}`);
      }
      const inputSchema = await $RefParser.dereference(schemaPath);
      const { valid, errors } = validateData(inputSchema, input);
      if (!valid) {
        throw new Error(`Input validation failed: ${JSON.stringify(errors)}`);
      }
    }

    // 4. Render the Handlebars prompt (passing {} if no input)
    const template = Handlebars.compile(prompt.activePromptVersion.promptTemplate);
    const finalPrompt = template(input || {});

    // 5. Load and dereference the output schema
    const outSchemaPath = path.join(process.cwd(), 'schemas', prompt.outputSchema);
    if (!fs.existsSync(outSchemaPath)) {
      throw new Error(`Output schema file not found at ${outSchemaPath}`);
    }
    const outputSchema = await $RefParser.dereference(outSchemaPath);

    // 6. Invoke the LLM
    const llm = gpt4OSearchModel.withStructuredOutput(outputSchema);
    const result = await llm.invoke(finalPrompt);

    // 7. Validate output
    const { valid: outValid, errors: outErrs } = validateData(outputSchema, result);
    if (!outValid) {
      throw new Error(`Output validation failed: ${JSON.stringify(outErrs)}`);
    }

    // 8. Mark invocation complete
    await prisma.promptInvocation.update({
      where: { id: invocation.id },
      data: {
        outputJson: JSON.stringify(result),
        status: PromptInvocationStatus.Completed,
        updatedAt: new Date(),
      },
    });

    return JSON.stringify(result, null, 2);
  } catch (err) {
    await prisma.promptInvocation.update({
      where: { id: invocation.id },
      data: {
        status: PromptInvocationStatus.Failed,
        error: (err as any).message,
        updatedAt: new Date(),
      },
    });
    throw err;
  }
}

function validateData(schema: object, data: unknown): { valid: boolean; errors?: ErrorObject[] } {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid: !!valid, errors: validate.errors ?? [] };
}
