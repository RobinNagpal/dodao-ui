import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "@/llm/koalaGainsConstants";

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
  rawText: string;
}

function extractGroundingSources(
  resp: any
): Array<{ uri: string; title?: string }> {
  const sources: Array<{ uri: string; title?: string }> = [];
  const chunks =
    resp?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  for (const chunk of chunks) {
    if (chunk.web) {
      sources.push({ uri: chunk.web.uri || "", title: chunk.web.title });
    } else if (chunk.maps) {
      sources.push({ uri: chunk.maps.uri || "", title: chunk.maps.title });
    } else if (chunk.retrievedContext) {
      sources.push({
        uri: chunk.retrievedContext.uri || "",
        title: chunk.retrievedContext.title,
      });
    }
  }

  const seen = new Set<string>();
  return sources.filter((s) => {
    if (!s.uri) return false;
    if (seen.has(s.uri)) return false;
    seen.add(s.uri);
    return true;
  });
}

export async function getGroundedStructuredResponse<Output>(
  prompt: string,
  modelName: GeminiModel,
  outputJsonSchema: object
): Promise<GroundedStructuredResponse<Output>> {
  const resp: any = await geminiWithSearchModel.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseJsonSchema: outputJsonSchema,
    },
  });

  const rawText: string = resp?.text || "";
  if (!rawText) {
    throw new Error("No text returned from grounded structured response");
  }

  let parsed: Output;
  try {
    parsed = JSON.parse(rawText) as Output;
  } catch (e) {
    throw new Error(
      `Failed to parse grounded JSON output. Raw text starts with: ${rawText.slice(
        0,
        200
      )}`
    );
  }

  const sources = extractGroundingSources(resp);

  return {
    result: parsed,
    sources,
    rawText,
  };
}

export async function getGroundedResponse(
  prompt: string,
  modelName: GeminiModel
): Promise<GroundedResponse> {
  const groundingTool = {
    googleSearch: {},
  };

  const config = {
    tools: [groundingTool],
  };

  const searchResponse: any = await geminiWithSearchModel.models.generateContent(
    {
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config,
    }
  );

  const searchResult = searchResponse.text || "";
  const sources = extractGroundingSources(searchResponse);

  return {
    text: searchResult,
    sources,
  };
}

export async function getGroundedResponseText(
  prompt: string,
  modelName: GeminiModel
): Promise<string> {
  const response = await getGroundedResponse(prompt, modelName);
  return response.text;
}
