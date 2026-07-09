import { getDefaultClaudeModel } from '@/types/llmConstants';
import { callClaudeWithOAuth } from '@/util/claude/claude-oauth-client';
import { assertClaudeUsageLimitNotExceeded } from '@/util/claude/claude-usage-limit';

/**
 * Claude structured-output helper used by `getLLMResponse` when
 * `LLM_PROVIDER=claude`. Given an already-compiled prompt and the parsed output
 * JSON schema, it asks Claude (via the subscription OAuth path) to emit raw JSON
 * for that schema and returns the parsed object.
 *
 * It is intentionally a THIN, pure helper: it does NOT touch invocation status
 * or validate the result — `getLLMResponse` owns the retry loop, Ajv
 * validation (`validateData`), and Completed/Failed bookkeeping, shared with the
 * Gemini/OpenAI path. Keeping those out here also avoids an import cycle with
 * `get-llm-response.ts`.
 *
 * Being provider-agnostic in its inputs (prompt + schema), the same helper backs
 * stock, ETF, tariff, etc. report generation.
 *
 * We don't use Anthropic structured-outputs (`output_config.format`) because the
 * dereferenced report schemas contain constructs it doesn't support and it isn't
 * available on every model; prompting for raw JSON + validating downstream works
 * on any model and with the existing schemas unchanged.
 */

/** Non-streaming output cap for report JSON. Generous, since report sections can be large. */
const REPORT_MAX_TOKENS = 32000;

export interface ClaudeStructuredResultOptions {
  /** Override the Claude model. Defaults to `getDefaultClaudeModel()` (LLM_MODEL / claude-opus-4-7). */
  model?: string;
  /** Override the output token cap. Defaults to 32000. */
  maxTokens?: number;
}

/**
 * Best-effort extraction of a JSON object from Claude's text response — strips a
 * ```json fenced block if present, otherwise falls back to the outermost
 * `{ ... }` span. Guards against the model wrapping the JSON in prose/markdown.
 */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return candidate.slice(firstBrace, lastBrace + 1);
  }
  return candidate;
}

/**
 * Calls Claude for a report prompt and returns the parsed JSON object. Throws on
 * a failed API call or unparseable JSON — the caller's retry loop handles it.
 */
export async function getClaudeStructuredResult<Output>(prompt: string, outputSchema: object, options: ClaudeStructuredResultOptions = {}): Promise<Output> {
  const model = options.model ?? getDefaultClaudeModel();

  // Verify the Claude subscription usage limit isn't already (near) exhausted
  // before spending a large, high-effort generation call. Throws
  // ClaudeUsageLimitExceededError if a usage window is at/above the hard-stop;
  // the read is cached briefly so the sequential section calls in one report run
  // don't each re-fetch. Gate on the per-model weekly window matching `model`.
  await assertClaudeUsageLimitNotExceeded({ model: model.includes('sonnet') ? 'sonnet' : 'opus' });

  const finalPrompt =
    `${prompt}\n\n` +
    `Return ONLY a single valid JSON object that strictly conforms to the following JSON schema. ` +
    `Do not include any explanation, prose, comments, or markdown code fences — output raw JSON only.\n\n` +
    `JSON schema:\n${JSON.stringify(outputSchema)}`;

  const { text } = await callClaudeWithOAuth({
    prompt: finalPrompt,
    system: 'You are a precise data generator for financial reports. Output only valid JSON matching the requested schema — no prose, no markdown.',
    model,
    maxTokens: options.maxTokens ?? REPORT_MAX_TOKENS,
    // "high" effort per request; if a model/plan doesn't support it the call errors and the caller retries.
    effort: 'high',
  });

  return JSON.parse(extractJson(text)) as Output;
}
