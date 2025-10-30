export const KoalaGainsSpaceId = "koala_gains";

export enum LLMProvider {
  OPENAI = "openai",
  GEMINI = "gemini",
  GEMINI_WITH_GROUNDING = "gemini-with-grounding",
}

export enum GeminiModel {
  GEMINI_2_5_PRO = "models/gemini-2.5-pro",
  GEMINI_2_5_PRO_GROUNDING = "gemini-2.5-pro", // For GoogleGenAI grounding calls (no "models/" prefix)
}
