/**
 * LLM Provider Types and Model Names
 * Centralized enums and constants for LLM providers and models
 */

export enum LLMProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  GEMINI_WITH_GROUNDING = 'gemini-with-grounding',
}

export enum GeminiModel {
  GEMINI_2_5_PRO = 'models/gemini-2.5-pro',
  GEMINI_2_5_PRO_GROUNDING = 'gemini-2.5-pro', // For GoogleGenAI grounding calls (no "models/" prefix)
}

export enum GeminiModelType {
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_2_5_PRO_WITH_GOOGLE_SEARCH = 'gemini-2.5-pro-with-google-search',
}

export enum OpenAIModel {
  GPT_4 = 'gpt-4',
}

// Type union for all model names
export type ModelName = GeminiModel | OpenAIModel | string;

// Helper function to get model name as string
export function getModelName(model: ModelName): string {
  return typeof model === 'string' ? model : model;
}

// Helper function to get provider as string
export function getProvider(provider: LLMProvider): string {
  return provider;
}
