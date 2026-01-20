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

  if (searchResponse.candidates && searchResponse.candidates[0]?.groundingMetadata?.groundingChunks) {
    for (const chunk of searchResponse.candidates[0].groundingMetadata.groundingChunks) {
      // Handle web sources
      if (chunk.web) {
        sources.push({
          uri: chunk.web.uri || '',
          title: chunk.web.title,
        });
      }
      // Handle maps sources
      else if (chunk.maps) {
        sources.push({
          uri: chunk.maps.uri || '',
          title: chunk.maps.title,
        });
      }
      // Handle retrieved context sources
      else if (chunk.retrievedContext) {
        sources.push({
          uri: chunk.retrievedContext.uri || '',
          title: chunk.retrievedContext.title,
        });
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
