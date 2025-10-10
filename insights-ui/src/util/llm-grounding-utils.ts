import { GoogleGenAI } from '@google/genai';
import { GeminiModel } from '@/types/llmConstants';

const geminiWithSearchModel = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function getGroundedResponse(prompt: string, modelName: GeminiModel): Promise<string> {
  const groundingTool = {
    googleSearch: {},
  };

  const config = {
    tools: [groundingTool],
  };

  const searchResponse = await geminiWithSearchModel.models.generateContent({
    model: modelName,
    contents: prompt,
    config,
  });

  const searchResult = searchResponse.text;
  return searchResult || '';
}
