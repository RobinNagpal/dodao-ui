import { GoogleGenAI } from '@google/genai';
import { GeminiModel } from '@/types/llmConstants';

const geminiWithSearchModel = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export interface GroundedResponse {
  text: string;
  sources: Array<{
    uri: string;
    title?: string;
  }>;
}

export async function getGroundedResponse(prompt: string, modelName: GeminiModel): Promise<GroundedResponse> {
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

  const searchResult = searchResponse.text || '';

  // Extract grounding sources from the response
  const sources: Array<{ uri: string; title?: string }> = [];

  if (searchResponse.candidates && searchResponse.candidates[0]?.groundingAttributions) {
    for (const attribution of searchResponse.candidates[0].groundingAttributions) {
      if (attribution.sources) {
        for (const source of attribution.sources) {
          sources.push({
            uri: source.uri,
            title: source.title,
          });
        }
      }
    }
  }

  return {
    text: searchResult,
    sources,
  };
}

// Backward compatibility function
export async function getGroundedResponseText(prompt: string, modelName: GeminiModel): Promise<string> {
  const response = await getGroundedResponse(prompt, modelName);
  return response.text;
}
