import { ChatOpenAI } from '@langchain/openai';
import Ajv from 'ajv';
import { prisma } from '@/prisma';
import { PromptInvocationStatus } from '.prisma/client';

interface GetLLMResponseOpts {
  invocationId: string;
  llmProvider: string;
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
      if (llmProvider.toLowerCase() !== 'openai') {
        throw new Error(`Unsupported llmProvider: ${llmProvider}`);
      }
      const llm = new ChatOpenAI({ model: modelName });
      const structured = llm.withStructuredOutput(outputSchema);

      const result = await structured.invoke(prompt);
      lastResult = result;

      const valid = validate(result);
      if (!valid) {
        console.error('Schema validation errors:', validate.errors);
        throw new Error(`Validation failed: ${JSON.stringify(validate.errors)}`);
      }

      await prisma.promptInvocation.update({
        where: { id: invocationId },
        data: {
          outputJson: JSON.stringify(result),
          status: PromptInvocationStatus.Completed,
          updatedAt: new Date(),
        },
      });
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
