import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ZodObject } from 'zod';

export const geminiModel = new ChatGoogleGenerativeAI({
  model: 'models/gemini-2.5-pro',
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

export function cleanOpenAIUrls(obj: any): any {
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) return obj.map(cleanOpenAIUrls);
    const result: Record<string, any> = {};
    for (const key in obj) result[key] = cleanOpenAIUrls(obj[key]);
    return result;
  } else if (typeof obj === 'string') {
    return obj.replace(/(\?utm_source=openai|&utm_source=openai|utm_source=openai)$/, '');
  }
  return obj;
}

export function recursivelyCleanOpenAiUrls(data: any): any {
  const suffix1 = '?utm_source=openai';
  const suffix2 = '&utm_source=openai';
  const linkRe = /(\[.*?\]\()([^)]+)(\))/g;

  if (typeof data === 'string') {
    let s = data.replace(linkRe, (_m, p, url, sfx) => {
      if (url.endsWith(suffix1)) url = url.slice(0, -suffix1.length);
      else if (url.endsWith(suffix2)) url = url.slice(0, -suffix2.length);
      return `${p}${url}${sfx}`;
    });
    if (s.endsWith(suffix1)) s = s.slice(0, -suffix1.length);
    else if (s.endsWith(suffix2)) s = s.slice(0, -suffix2.length);
    return s;
  }

  if (Array.isArray(data)) return data.map(recursivelyCleanOpenAiUrls);
  if (data !== null && typeof data === 'object') {
    const o: Record<string, any> = {};
    for (const k in data) o[k] = recursivelyCleanOpenAiUrls(data[k]);
    return o;
  }

  return data;
}

/**
 * Prompt the right Gemini client (static vs. search‑grounded).
 */
export async function getLlmResponse<T extends Record<string, any>>(
  prompt: string,
  schema: ZodObject<any>,
  model?: 'gemini',
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  console.log('Invoking Gemini for prompt:', prompt);
  let lastErr: Error | null = null;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      const client = geminiModel;
      const llmWithSchema = client.withStructuredOutput<T>(schema);
      const res = await llmWithSchema.invoke(prompt);
      console.log('✅ Gemini response received');
      return res;
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
