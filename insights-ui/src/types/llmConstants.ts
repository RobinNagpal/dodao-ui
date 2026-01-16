// only gemini models are supported for now
// remove all openai models

export enum LLMProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  GEMINI_WITH_GROUNDING = 'gemini-with-grounding',
}

export enum GeminiModel {
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_2_5_PRO_GROUNDING = 'gemini-2.5-pro', // For GoogleGenAI grounding calls (no "models/" prefix)
  GEMINI_3_PRO_PREVIEW = 'gemini-3-pro-preview',
}

export enum GeminiModelType {
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_2_5_PRO_WITH_GOOGLE_SEARCH = 'gemini-2.5-pro-with-google-search',
  GEMINI_3_PRO_PREVIEW = 'gemini-3-pro-preview',
}

/**
 * Gets the default Gemini model from environment variable GEMINI_MODEL,
 * defaults to GEMINI_2_5_PRO if not set or invalid
 */
export function getDefaultGeminiModel(): GeminiModel {
  const envModel = process.env.GEMINI_MODEL;

  if (!envModel) {
    return GeminiModel.GEMINI_2_5_PRO;
  }

  // Validate that the env value is a valid GeminiModel
  const validModels = Object.values(GeminiModel);
  if (validModels.includes(envModel as GeminiModel)) {
    return envModel as GeminiModel;
  }

  console.warn(`Invalid GEMINI_MODEL value: ${envModel}. Using default GEMINI_2_5_PRO`);
  return GeminiModel.GEMINI_2_5_PRO;
}
