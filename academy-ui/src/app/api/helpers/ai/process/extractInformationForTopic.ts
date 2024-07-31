import { callOpenAiForPrompt } from '@/app/api/helpers/ai/callOpenAiForPrompt';
import { splitContentIntoSmallerChunks } from '@/app/api/helpers/ai/splitContentIntoSmallerChunks';
import { cleanupContent } from '@/app/api/helpers/ai/text/cleanupContent';
import dotenv from 'dotenv';
import tiktoken from 'tiktoken';

dotenv.config();

const encoding = tiktoken.encoding_for_model('gpt-3.5-turbo');

function getPromptForTopicInformation(chunk: string, topic: string) {
  const prompt = `
  Extract all the matching information related to the given topic from the below content. After you extract the information, write a few paragraphs related to that topic from the matching content.
  You should follow the following rules when generating the content:
  - Be as detailed as possible.
  - Remove duplicate content and write content in small coherent paragraphs. 
  
  
  TOPIC:
  - ${topic}
  
  
  CONTENT TO BE REWRITTEN:
  ${chunk}
  `;
  return prompt;
}

export async function extractInformationForTopic(inputContent: string, topic: string): Promise<string> {
  const cleanedContent = cleanupContent(inputContent);
  const chunkTokens = encoding.encode(cleanedContent);

  const maxTokens = 10000;

  if (!inputContent) {
    return '';
  }
  if (chunkTokens.length <= maxTokens) {
    return await callOpenAiForPrompt(cleanedContent, () => getPromptForTopicInformation(cleanedContent, topic));
  } else {
    const smallerContents: string[] = splitContentIntoSmallerChunks(cleanedContent, maxTokens);

    const summaryOfSmallerContents: string[] = [];
    for (const currentChunk of smallerContents) {
      const summary = await callOpenAiForPrompt(currentChunk, () => getPromptForTopicInformation(currentChunk, topic));
      summaryOfSmallerContents.push(summary);
    }

    const finalSummary = summaryOfSmallerContents.join(' ');
    return extractInformationForTopic(finalSummary, topic);
  }
}
