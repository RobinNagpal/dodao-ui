import { callOpenAiForPrompt } from '@/app/api/helpers/ai/callOpenAiForPrompt';
import { splitContentIntoSmallerChunks } from '@/app/api/helpers/ai/splitContentIntoSmallerChunks';
import { cleanupContent } from '@/app/api/helpers/ai/text/cleanupContent';
import dotenv from 'dotenv';
import tiktoken from 'tiktoken';

dotenv.config();

const encoding = tiktoken.encoding_for_model('gpt-3.5-turbo');

function getPromptForSummarization(chunk: string, maxTokens: number) {
  const chunkTokens = encoding.encode(chunk);
  const prompt =
    chunkTokens.length > maxTokens
      ? `
  Rewrite and reduce the word count to half of the original word count. You should follow the following rules when generating the content:
  - Be as detailed as possible.
  - Remove duplicate content and write content in small coherent paragraphs. 
    
  
  CONTENT TO BE REWRITTEN:
  ${chunk}
  `
      : `
  Rewrite and keep the word count same as the original word count. You should follow the following rules when generating the content:
  - Be as detailed as possible.
  - Remove duplicate content and write content in small coherent paragraphs.
  
  
  CONTENT TO BE REWRITTEN:
  ${chunk}
  `;
  return prompt;
}

export async function generateSummaryOfContent(chunk: string): Promise<string> {
  const cleanedContent = cleanupContent(chunk);
  const chunkTokens = encoding.encode(cleanedContent);

  const maxTokens = 10000;

  if (!chunk) {
    return '';
  }
  if (chunkTokens.length <= maxTokens) {
    return await callOpenAiForPrompt(cleanedContent, () => getPromptForSummarization(chunk, maxTokens));
  } else {
    const smallerContents: string[] = splitContentIntoSmallerChunks(cleanedContent, maxTokens);

    const summaryOfSmallerContents: string[] = [];
    for (const currentChunk of smallerContents) {
      const summary = await callOpenAiForPrompt(currentChunk, () => getPromptForSummarization(currentChunk, maxTokens));
      summaryOfSmallerContents.push(summary);
    }

    const finalSummary = summaryOfSmallerContents.join(' ');
    return generateSummaryOfContent(finalSummary);
  }
}
