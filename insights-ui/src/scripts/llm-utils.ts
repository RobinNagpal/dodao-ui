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

export const gpt4oMiniSearchModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini-search-preview',
});

export const outputInstructions =
  '' +
  `#  For output content:
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
    if (Array.isArray(obj)) {
      return obj.map(cleanOpenAIUrls);
    } else {
      const result: Record<string, any> = {};
      for (const key in obj) {
        result[key] = cleanOpenAIUrls(obj[key]);
      }
      return result;
    }
  } else if (typeof obj === 'string') {
    // Remove ?utm_source=openai, &utm_source=openai, or utm_source=openai at the end of the string
    return obj.replace(/(\?utm_source=openai|&utm_source=openai|utm_source=openai)$/, '');
  }
  return obj;
}

/**
 * Recursively traverses an object or array.
 * - Removes specific trailing query parameters (?utm_source=openai or &utm_source=openai)
 *   from string values that are plain URLs.
 * - Removes the same parameters from URLs embedded within Markdown links ([text](url))
 *   found within string values.
 * @param data The data structure (object, array, string, etc.) to clean.
 * @returns The cleaned data structure.
 */
export function recursivelyCleanOpenAiUrls(data: any): any {
  const suffixToRemove1 = '?utm_source=openai';
  const suffixToRemove2 = '&utm_source=openai'; // Handle cases where it's not the first query param

  // Regex to find Markdown links and capture the parts: prefix=[text](, url, suffix=)
  const markdownLinkRegex = /(\[.*?\]\()([^)]+)(\))/g;

  // --- String Processing ---
  if (typeof data === 'string') {
    let cleanedString = data;

    // 1. Clean URLs within Markdown links inside the string
    cleanedString = cleanedString.replace(markdownLinkRegex, (match, prefix: string, url: string, suffixMark: string): string => {
      let cleanedUrl = url;
      if (cleanedUrl.endsWith(suffixToRemove1)) {
        cleanedUrl = cleanedUrl.substring(0, cleanedUrl.length - suffixToRemove1.length);
      } else if (cleanedUrl.endsWith(suffixToRemove2)) {
        // Use else if
        cleanedUrl = cleanedUrl.substring(0, cleanedUrl.length - suffixToRemove2.length);
      }
      // Reconstruct the markdown link with the potentially cleaned URL
      return `${prefix}${cleanedUrl}${suffixMark}`;
    });

    // 2. Clean the string IF the entire string itself is a URL ending with the suffix
    // (This handles cases where the JSON value is just the URL string)
    if (cleanedString.endsWith(suffixToRemove1)) {
      cleanedString = cleanedString.substring(0, cleanedString.length - suffixToRemove1.length);
    } else if (cleanedString.endsWith(suffixToRemove2)) {
      // Use else if
      cleanedString = cleanedString.substring(0, cleanedString.length - suffixToRemove2.length);
    }

    return cleanedString;
  }

  // --- Array Processing ---
  if (Array.isArray(data)) {
    // Recursively clean each item in the array
    return data.map((item) => recursivelyCleanOpenAiUrls(item));
  }

  // --- Object Processing ---
  // Use `typeof data === 'object'` and `data !== null` to check for plain objects
  if (data !== null && typeof data === 'object') {
    const newObj: Record<string, any> = {};
    for (const key in data) {
      // Ensure it's an own property, not from the prototype chain
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Recursively clean the value associated with the key
        newObj[key] = recursivelyCleanOpenAiUrls(data[key]);
      }
    }
    return newObj;
  }

  // Return primitives (numbers, booleans, null, undefined) and anything else as is
  return data;
}

export async function getLlmResponse<T extends Record<string, any>>(
  prompt: string,
  schema: ZodObject<any>,
  model: 'o4-mini' | 'gpt-4o-search-preview' | 'gpt-4o-mini-search-preview' | 'gpt-4o-mini' = 'o4-mini',
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  console.log('Invoking OpenAI for the prompt:', prompt);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const openai = new OpenAI({});
      if (model === 'gpt-4o-search-preview' || model === 'gpt-4o-mini-search-preview') {
        const response = await openai.beta.chat.completions.parse({
          model: model,
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
