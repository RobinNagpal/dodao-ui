// only gemini models are supported for now
// remove all openai models

export enum LLMProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  GEMINI_WITH_GROUNDING = 'gemini-with-grounding',
}

export enum GeminiModel {
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_3_1_PRO_PREVIEW = 'gemini-3.1-pro-preview',
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

/**
 * Default Claude model used when generating reports via the Claude
 * subscription OAuth path (see `getClaudeStructuredResponse`).
 */
export const DEFAULT_CLAUDE_MODEL = 'claude-opus-4-8';

/**
 * Gets the Claude model from environment variable ANTHROPIC_MODEL, defaulting
 * to DEFAULT_CLAUDE_MODEL when unset. Mirrors `getDefaultGeminiModel()` — set
 * `ANTHROPIC_MODEL` to override, otherwise the default is used.
 */
export function getDefaultClaudeModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
}

/**
 * Gets the default LLM provider from environment variable LLM_PROVIDER,
 * defaults to GEMINI if not set or invalid
 */
export function getDefaultLLMProvider(): LLMProvider {
  const envProvider = process.env.LLM_PROVIDER;

  if (!envProvider) {
    return LLMProvider.GEMINI;
  }

  // Validate that the env value is a valid LLMProvider
  const validProviders = Object.values(LLMProvider);
  if (validProviders.includes(envProvider as LLMProvider)) {
    return envProvider as LLMProvider;
  }

  console.warn(`Invalid LLM_PROVIDER value: ${envProvider}. Using default GEMINI`);
  return LLMProvider.GEMINI;
}
