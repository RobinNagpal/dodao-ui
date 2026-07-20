import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import { ClaudeModel, GeminiModel, LLMProvider, getDefaultClaudeModel, getDefaultGeminiModel, getDefaultLLMProvider } from '@/types/llmConstants';

/**
 * Server-only resolvers for the DEFAULT LLM provider / model, layered over the code
 * constants in `llmConstants.ts`.
 *
 * An explicit per-run selection ALWAYS wins — these apply only when a generation
 * request carries no provider/model. Values come from the App Settings KV
 * (`LLM_DEFAULT_PROVIDER` / `LLM_DEFAULT_GEMINI_MODEL` / `LLM_DEFAULT_CLAUDE_MODEL`)
 * and fall back to the code constant when unset or invalid, so a bad value can never
 * break generation.
 *
 * Keep this OUT of client bundles — it reads server-only config. Client dropdowns use
 * the plain constants / select-items in `llmConstants.ts` instead.
 */

const PROVIDERS = new Set<string>(Object.values(LLMProvider));
const GEMINI_MODELS = new Set<string>(Object.values(GeminiModel));
const CLAUDE_MODELS = new Set<string>(Object.values(ClaudeModel));

export async function getConfiguredDefaultProvider(): Promise<LLMProvider> {
  const value = await getAppConfigValue('LLM_DEFAULT_PROVIDER');
  return value && PROVIDERS.has(value) ? (value as LLMProvider) : getDefaultLLMProvider();
}

export async function getConfiguredDefaultGeminiModel(): Promise<string> {
  const value = await getAppConfigValue('LLM_DEFAULT_GEMINI_MODEL');
  return value && GEMINI_MODELS.has(value) ? value : getDefaultGeminiModel();
}

export async function getConfiguredDefaultClaudeModel(): Promise<string> {
  const value = await getAppConfigValue('LLM_DEFAULT_CLAUDE_MODEL');
  return value && CLAUDE_MODELS.has(value) ? value : getDefaultClaudeModel();
}

/** Provider-aware default model: Claude default for the Claude provider, Gemini default otherwise. */
export async function getConfiguredDefaultModelForProvider(provider: LLMProvider): Promise<string> {
  return provider === LLMProvider.CLAUDE ? getConfiguredDefaultClaudeModel() : getConfiguredDefaultGeminiModel();
}
