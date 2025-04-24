import { ChatOpenAI } from '@langchain/openai';
import { ZodObject } from 'zod';

const o4MiniModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'o4-mini',
  temperature: 1,
});

export const gpt4OSearchModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-search-preview',
});

export const outputInstructions =
  '' +
  `#  For output content:
- Cite the latest figures and embed hyperlinks to sources.
- Include hyperlinks/citations in the content where ever possible in the markdown format.
- Dont forget to include hyperlinks/citations in the content where ever possible.
- Avoid LaTeX, italics, or KaTeX formatting, or   character for space
- Use only headings and subheadings, bold, bullets, points, tables for formatting the content.
- Use markdown format for output.
- All amounts, dollar values, or figures should be wrapped in backticks.
`;

export async function getLlmResponse<T extends Record<string, any>>(prompt: string, schema: ZodObject<any>, model: ChatOpenAI = o4MiniModel): Promise<T> {
  const structuredLLM = model.withStructuredOutput<T>(schema);
  const headingsResponse: T = await structuredLLM.invoke(prompt);
  return headingsResponse;
}
