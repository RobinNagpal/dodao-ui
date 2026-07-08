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
 * The default provider/model are fixed constants — they are NOT read from the
 * `LLM_PROVIDER` / `LLM_MODEL` env vars anymore. Any call that doesn't carry an
 * explicit UI selection resolves to these defaults. Change the default here (not
 * via env) if the fallback provider/model should differ.
 */

/**
 * The single default Gemini model used when no explicit model is selected.
 */
export function getDefaultGeminiModel(): GeminiModel {
  return GeminiModel.GEMINI_2_5_PRO;
}

/**
 * The single default Claude model used when no explicit model is selected
 * (see getClaudeStructuredResult). Tied to the typed ClaudeModel enum so there
 * is one source of truth for the id.
 */
export function getDefaultClaudeModel(): string {
  return ClaudeModel.CLAUDE_OPUS_4_7;
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
 * The single default LLM provider used when no explicit provider is selected.
 */
export function getDefaultLLMProvider(): LLMProvider {
  return LLMProvider.GEMINI;
}
