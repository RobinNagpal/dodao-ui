import { ChatOpenAI } from '@langchain/openai';
import OpenAI from 'openai';
import { zodResponseFormat, zodTextFormat } from 'openai/helpers/zod';
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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getLlmResponse<T extends Record<string, any>>(
  prompt: string,
  schema: ZodObject<any>,
  model: 'o4-mini' | 'gpt-4o-search-preview' = 'o4-mini',
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const openai = new OpenAI({});
      if (model === 'gpt-4o-search-preview') {
        const response = await openai.beta.chat.completions.parse({
          model: 'gpt-4o-search-preview',
          web_search_options: {},
          messages: [
            {
              role: 'user',
              content: 'search and find information for \n\n' + prompt,
            },
          ],
          response_format: zodResponseFormat(schema, 'structured_output'),
        });

        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        const searchResponse = response.choices[0].message.parsed;

        console.log(`Search Response: ${JSON.stringify(searchResponse)}`);
        return searchResponse as T;
      }
      const modelConfig = model === 'o4-mini' ? o4MiniModel : gpt4OSearchModel;
      const structuredLLM = modelConfig.withStructuredOutput<T>(schema);
      const llmStructuredResponse: T = await structuredLLM.invoke(prompt);
      console.log(`Got LLM Response`);
      return llmStructuredResponse;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed: ${error}`);

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}
