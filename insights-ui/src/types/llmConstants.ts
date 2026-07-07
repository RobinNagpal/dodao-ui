// only gemini models are supported for now
// remove all openai models

export enum LLMProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  GEMINI_WITH_GROUNDING = 'gemini-with-grounding',
  // Claude via the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`), authenticated
  // with a Claude subscription (Pro/Max) through CLAUDE_CODE_OAUTH_TOKEN — NOT a metered
  // Anthropic API key. See src/util/claude-agent-utils.ts.
  ANTHROPIC = 'anthropic',
}

export enum GeminiModel {
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  GEMINI_3_1_PRO_PREVIEW = 'gemini-3.1-pro-preview',
}

export enum ClaudeModel {
  CLAUDE_OPUS_4_8 = 'claude-opus-4-8',
  CLAUDE_SONNET_4_6 = 'claude-sonnet-4-6',
}

/**
 * The full set of model identifiers we can dispatch to. `GeminiModel` covers the
 * Gemini/OpenAI path; `ClaudeModel` covers the Claude Agent SDK path. Fields that used
 * to be typed `GeminiModel` are widened to this union so a Claude model can flow through
 * the same invocation/prompt/output-schema machinery.
 */
export type LLMModel = GeminiModel | ClaudeModel;

/** Type guard: true when the given model identifier is a Claude model. */
export function isClaudeModel(model: LLMModel): model is ClaudeModel {
  return (Object.values(ClaudeModel) as string[]).includes(model);
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

/**
 * Gets the default Claude model from environment variable CLAUDE_MODEL,
 * defaults to CLAUDE_OPUS_4_8 if not set or invalid.
 */
export function getDefaultClaudeModel(): ClaudeModel {
  const envModel = process.env.CLAUDE_MODEL;

  if (!envModel) {
    return ClaudeModel.CLAUDE_OPUS_4_8;
  }

  const validModels = Object.values(ClaudeModel);
  if (validModels.includes(envModel as ClaudeModel)) {
    return envModel as ClaudeModel;
  }

  console.warn(`Invalid CLAUDE_MODEL value: ${envModel}. Using default CLAUDE_OPUS_4_8`);
  return ClaudeModel.CLAUDE_OPUS_4_8;
}

/**
 * Stocks-only opt-in to Claude generation.
 *
 * Set `STOCK_LLM_PROVIDER=anthropic` to route STOCK (ticker V1) report generation through
 * the Claude Agent SDK instead of Gemini. Returns the provider+model override to apply, or
 * `undefined` when the flag is unset (leaving stocks — and everything else — on Gemini).
 *
 * Deliberately scoped to stocks so ETFs, tariffs, and daily movers stay on their current
 * providers. Only `anthropic` is recognized today; any other value is ignored.
 */
export function getStockLLMProviderOverride(): { llmProvider: LLMProvider; model: ClaudeModel } | undefined {
  if (process.env.STOCK_LLM_PROVIDER === LLMProvider.ANTHROPIC) {
    return { llmProvider: LLMProvider.ANTHROPIC, model: getDefaultClaudeModel() };
  }
  return undefined;
}
