import { GoogleGenAI } from '@google/genai';
import { GeminiModel, getDefaultGeminiModel } from '@/types/llmConstants';

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

export interface GroundedStructuredResponse<Output> {
  result: Output;
  sources: Array<{
    uri: string;
    title?: string;
  }>;
  rawText: string; // raw model text (should be JSON string when responseMimeType is application/json)
}

function extractGroundingSources(resp: any): Array<{ uri: string; title?: string }> {
  const sources: Array<{ uri: string; title?: string }> = [];
  const chunks = resp?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  for (const chunk of chunks) {
    if (chunk.web) {
      sources.push({ uri: chunk.web.uri || '', title: chunk.web.title });
    } else if (chunk.maps) {
      sources.push({ uri: chunk.maps.uri || '', title: chunk.maps.title });
    } else if (chunk.retrievedContext) {
      sources.push({ uri: chunk.retrievedContext.uri || '', title: chunk.retrievedContext.title });
    }
  }

  // Optional: de-dupe by uri
  const seen = new Set<string>();
  return sources.filter((s) => {
    if (!s.uri) return false;
    if (seen.has(s.uri)) return false;
    seen.add(s.uri);
    return true;
  });
}

/**
 * Grounding (Google Search) + structured JSON output (single call).
 *
 * If the model/tooling combo doesn't support structured outputs with tools,
 * this may throw — your caller should catch and fallback to 2-step.
 */
export async function getGroundedStructuredResponse<Output>(
  prompt: string,
  modelName: GeminiModel = getDefaultGeminiModel(),
  outputJsonSchema: object
): Promise<GroundedStructuredResponse<Output>> {
  const resp: any = await geminiWithSearchModel.models.generateContent({
    model: modelName,
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      // IMPORTANT: you already dereference schemas in get-llm-response.ts, so refs are not a problem.
      responseJsonSchema: outputJsonSchema,
    },
  });

  const rawText: string = resp?.text || '';
  if (!rawText) {
    throw new Error('No text returned from grounded structured response');
  }

  let parsed: Output;
  try {
    parsed = JSON.parse(rawText) as Output;
  } catch (e) {
    throw new Error(`Failed to parse grounded JSON output. Raw text starts with: ${rawText.slice(0, 200)}`);
  }

  const sources = extractGroundingSources(resp);

  return {
    result: parsed,
    sources,
    rawText,
  };
}

/**
 * Grounding only (text). Your existing function, kept for fallback.
 */
export async function getGroundedResponse(prompt: string, modelName: GeminiModel = getDefaultGeminiModel()): Promise<GroundedResponse> {
  const groundingTool = {
    googleSearch: {},
  };

  const config = {
    tools: [groundingTool],
  };

  const searchResponse: any = await geminiWithSearchModel.models.generateContent({
    model: modelName,
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    config,
  });

  const searchResult = searchResponse.text || '';
  const sources = extractGroundingSources(searchResponse);

  return {
    text: searchResult,
    sources,
  };
}

// Backward compatibility function
export async function getGroundedResponseText(prompt: string, modelName: GeminiModel = getDefaultGeminiModel()): Promise<string> {
  const response = await getGroundedResponse(prompt, modelName);
  return response.text;
}
