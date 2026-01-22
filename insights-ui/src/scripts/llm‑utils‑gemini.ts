import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ZodObject } from 'zod';
import { GeminiModel, LLMProvider, getDefaultGeminiModel, getDefaultLLMProvider } from '@/types/llmConstants';
import { getGroundedResponse, getGroundedStructuredResponse } from '@/util/llm-grounding-utils';

export const geminiModel = new ChatGoogleGenerativeAI({
  model: GeminiModel.GEMINI_2_5_PRO,
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 1,
});

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
 * Prompt the right Gemini client (static vs. search-grounded).
 * For Gemini 3 Pro Preview with grounding, uses single-call structured output when possible.
 */
export async function getLlmResponse<T extends Record<string, any>>(
  prompt: string,
  schema: ZodObject<any>,
  provider: LLMProvider = getDefaultLLMProvider(),
  model: GeminiModel = getDefaultGeminiModel(),
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  console.log(`Invoking Gemini (${provider}, ${model}) for prompt:`, prompt);
  let lastErr: Error | null = null;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      if (provider === LLMProvider.GEMINI_WITH_GROUNDING) {
        // For Gemini 3 Pro Preview, try single-call grounded structured output first
        if (model === GeminiModel.GEMINI_3_PRO_PREVIEW) {
          console.log('Using Gemini 3 Pro Preview with grounding - trying single-call grounded structured output...');

          try {
            const groundedStructured = await getGroundedStructuredResponse<T>(prompt, model, schema);

            console.log('✅ Single-call grounded structured output succeeded');
            return groundedStructured.result;
          } catch (singleCallErr) {
            console.warn('⚠️ Single-call grounded structured output failed; falling back to 2-step...', singleCallErr);

            // Step 1: Get grounded response from Gemini with Google Search
            const searchResult = await getGroundedResponse(prompt, model);
            console.log('✅ Grounded response obtained, now converting to structured output (fallback)');

            // Step 2: Convert grounded text to structured output using LangChain
            const structuredPrompt = `Please convert the given information into the given schema format.\n\n${searchResult.text}`;
            const client = geminiModel;
            const llmWithSchema = client.withStructuredOutput<T>(schema);
            const res = await llmWithSchema.invoke(structuredPrompt);
            console.log('✅ Structured output conversion completed');
            return res;
          }
        } else {
          // For other models, always use 2-step approach
          console.log(`Using Gemini with grounding - 2-step approach for model: ${model}`);

          // First, get response from Gemini with Google Search grounding
          const searchResult = await getGroundedResponse(prompt, model);
          console.log('✅ Gemini with search response received');

          // Now convert the search result to structured output using schema
          const structuredPrompt = `Please convert the given information into the given schema format.\n\n${searchResult.text}`;
          const client = geminiModel;
          const llmWithSchema = client.withStructuredOutput<T>(schema);
          const res = await llmWithSchema.invoke(structuredPrompt);
          console.log('✅ Structured output conversion completed');
          return res;
        }
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
