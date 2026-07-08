// only gemini models are supported for now
// remove all openai models

export enum LLMProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  GEMINI_WITH_GROUNDING = 'gemini-with-grounding',
  // Generate via the Claude subscription OAuth path (see getClaudeStructuredResult).
  CLAUDE = 'claude',
}

export enum GeminiModel {
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_3_1_PRO_PREVIEW = 'gemini-3.1-pro-preview',
}

/**
 * Claude models selectable for report generation (used with `LLMProvider.CLAUDE`,
 * the subscription OAuth path). Kept as a plain string enum so the selected id
 * flows straight through to the Anthropic call.
 */
export enum ClaudeModel {
  CLAUDE_OPUS_4_8 = 'claude-opus-4-8',
  CLAUDE_OPUS_4_7 = 'claude-opus-4-7',
  CLAUDE_SONNET_4_6 = 'claude-sonnet-4-6',
  CLAUDE_HAIKU_4_5 = 'claude-haiku-4-5',
}

/**
 * The model env var is provider-generic: `LLM_MODEL` holds the model for
 * whichever `LLM_PROVIDER` is active (a Gemini model id for gemini, a Claude
 * model id for claude). Each provider's getter reads the same var.
 */

/**
 * Gets the default Gemini model from environment variable LLM_MODEL, defaults
 * to GEMINI_2_5_PRO if not set or not a valid Gemini model. (A non-Gemini value
 * just means LLM_PROVIDER isn't gemini, so we silently fall back.)
 */
export function getDefaultGeminiModel(): GeminiModel {
  const envModel = process.env.LLM_MODEL;

  if (!envModel) {
    return GeminiModel.GEMINI_2_5_PRO;
  }

  // Validate that the env value is a valid GeminiModel
  const validModels = Object.values(GeminiModel);
  if (validModels.includes(envModel as GeminiModel)) {
    return envModel as GeminiModel;
  }

  return GeminiModel.GEMINI_2_5_PRO;
}

/**
 * Default Claude model used when `LLM_PROVIDER=claude` (see getClaudeStructuredResult).
 */
export const DEFAULT_CLAUDE_MODEL = 'claude-opus-4-7';

/**
 * Gets the Claude model from environment variable LLM_MODEL, defaulting to
 * DEFAULT_CLAUDE_MODEL when unset. Mirrors `getDefaultGeminiModel()` — set
 * `LLM_MODEL` to override, otherwise the default is used.
 */
export function getDefaultClaudeModel(): string {
  return process.env.LLM_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
}

/**
 * Provider-aware default model. Returns the Claude default for the Claude
 * provider and the Gemini default for every Gemini/OpenAI provider, so callers
 * don't accidentally hand a Gemini model id to the Claude path (or vice-versa)
 * when no explicit model was selected.
 */
export function getDefaultModelForProvider(provider: LLMProvider): string {
  return provider === LLMProvider.CLAUDE ? getDefaultClaudeModel() : getDefaultGeminiModel();
}

/** Minimal shape shared with `@dodao/web-core`'s `StyledSelectItem` (id + label). */
export interface LlmSelectItem {
  id: string;
  label: string;
}

/** Providers offered in the report-generation UI. */
export const llmProviderSelectItems: LlmSelectItem[] = [
  { id: LLMProvider.GEMINI, label: 'Gemini' },
  { id: LLMProvider.GEMINI_WITH_GROUNDING, label: 'Gemini (with grounding)' },
  { id: LLMProvider.CLAUDE, label: 'Claude' },
];

/** Models offered for a given provider in the report-generation UI. */
export function getModelSelectItemsForProvider(provider: LLMProvider): LlmSelectItem[] {
  if (provider === LLMProvider.CLAUDE) {
    return [
      { id: ClaudeModel.CLAUDE_OPUS_4_8, label: 'Claude Opus 4.8' },
      { id: ClaudeModel.CLAUDE_OPUS_4_7, label: 'Claude Opus 4.7' },
      { id: ClaudeModel.CLAUDE_SONNET_4_6, label: 'Claude Sonnet 4.6' },
      { id: ClaudeModel.CLAUDE_HAIKU_4_5, label: 'Claude Haiku 4.5' },
    ];
  }
  // Gemini and Gemini-with-grounding share the same Gemini model list.
  return [
    { id: GeminiModel.GEMINI_2_5_PRO, label: 'Gemini 2.5 Pro' },
    { id: GeminiModel.GEMINI_3_1_PRO_PREVIEW, label: 'Gemini 3.1 Pro Preview' },
  ];
}

/** First/default model id offered for a provider in the UI. */
export function getDefaultModelSelectionForProvider(provider: LLMProvider): string {
  return getModelSelectItemsForProvider(provider)[0].id;
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
