import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenAI } from '@google/genai';
import { ZodObject } from 'zod';

export const geminiModel = new ChatGoogleGenerativeAI({
  model: 'models/gemini-2.5-pro',
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 1,
});

export const geminiWithSearchModel = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export type GeminiModelType = 'gemini-2.5-pro' | 'gemini-2.5-pro-with-google-search';

export const outputInstructions = `
#  For output content:
- Cite the latest figures and embed hyperlinks to sources. Dont use or refer to koalagains.com for any kind of information and do not cite it as a reference for any data.
- Include hyperlinks/citations in the content where ever possible in the markdown format.
- Dont forget to include hyperlinks/citations in the content where ever possible.
- Avoid LaTeX, italics, or KaTeX formatting, or   character for space
- Use only headings and subheadings, bold, bullets, points, tables for formatting the content.
- Use markdown format for output.
- All amounts, dollar values, or figures should be wrapped in backticks.
`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Prompt the right Gemini client (static vs. search‑grounded).
 */
export async function getLlmResponse<T extends Record<string, any>>(
  prompt: string,
  schema: ZodObject<any>,
  model: GeminiModelType = 'gemini-2.5-pro',
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  console.log(`Invoking Gemini (${model}) for prompt:`, prompt);
  let lastErr: Error | null = null;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      if (model === 'gemini-2.5-pro-with-google-search') {
        // First, get response from Gemini with Google Search grounding
        const groundingTool = {
          googleSearch: {},
        };

        const config = {
          tools: [groundingTool],
        };

        const searchResponse = await geminiWithSearchModel.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config,
        });

        const searchResult = searchResponse.text;
        console.log('✅ Gemini with search response received');

        // Now convert the search result to structured output using schema
        const structuredPrompt = `Please convert the given information into the given schema format.\n\n${searchResult}`;
        const client = geminiModel;
        const llmWithSchema = client.withStructuredOutput<T>(schema);
        const res = await llmWithSchema.invoke(structuredPrompt);
        console.log('✅ Structured output conversion completed');
        return res;
      } else {
        // Use existing LangChain approach for regular gemini-2.5-pro
        const client = geminiModel;
        const llmWithSchema = client.withStructuredOutput<T>(schema);
        const res = await llmWithSchema.invoke(prompt);
        console.log('✅ Gemini response received');
        return res;
      }
    } catch (e) {
      lastErr = e as Error;
      console.warn(`Attempt ${i} failed: ${lastErr.message}`);
      if (i < maxRetries) {
        const delay = initialDelay * 2 ** (i - 1);
        console.log(`Retrying in ${delay}ms…`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Gemini failed after ${maxRetries} attempts: ${lastErr?.message}`);
}
