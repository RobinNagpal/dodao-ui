import { callClaudeWithOAuth } from '@/util/claude/claude-oauth-client';
import { getConfiguredDefaultClaudeModel } from '@/util/llm-default-config';

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
  /** Override the Claude model. Defaults to the App Settings `LLM_DEFAULT_CLAUDE_MODEL` (else claude-opus-4-7). */
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
  const model = options.model ?? (await getConfiguredDefaultClaudeModel());

  // Note: usage-limit pacing for auto-generated reports lives in the stock
  // generation processor (see `auto-stock-generation-utils.ts`), not here. This
  // path stays a thin generator — admin-triggered Claude requests intentionally
  // just surface a 429 if the subscription limit is full.

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
