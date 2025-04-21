import { ChatOpenAI } from '@langchain/openai';
import { ZodObject } from 'zod';

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'o4-mini',
  temperature: 1,
});

export async function getLlmResponse<T extends Record<string, any>>(prompt: string, schema: ZodObject<any>): Promise<T> {
  const structuredLLM = model.withStructuredOutput<T>(schema);
  const headingsResponse: T = await structuredLLM.invoke(prompt);
  console.log('LLM analysis response:\n', JSON.stringify(headingsResponse, null, 2));

  return headingsResponse;
}
