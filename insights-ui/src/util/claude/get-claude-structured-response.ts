import { getDefaultClaudeModel } from '@/types/llmConstants';
import { callClaudeWithOAuth } from '@/util/claude/claude-oauth-client';
import { updateInvocationStatus, validateData } from '@/util/get-llm-response';
import { PromptInvocationStatus } from '@prisma/client';

/**
 * Claude counterpart of `getLLMResponse` (the Gemini/OpenAI structured-output
 * runner). It is intentionally provider-agnostic in its inputs — it takes an
 * already-compiled prompt + the parsed output JSON schema + the invocation id —
 * so the SAME helper can back stock, ETF, tariff, etc. report generation. Only
 * the "call the model, get the answer, store it" step differs from the existing
 * flow; prompts, invocation rows, schemas, and downstream saving stay the same.
 *
 * Claude is called through the subscription OAuth path (`callClaudeWithOAuth`).
 * We don't use Anthropic structured-outputs (`output_config.format`) because the
 * dereferenced report schemas contain constructs it doesn't support; instead we
 * instruct Claude to emit raw JSON for the schema and validate it with the same
 * Ajv `validateData` the Gemini path uses, retrying on parse/validation failure.
 */

/** Non-streaming output cap for report JSON. Generous, since report sections can be large. */
const REPORT_MAX_TOKENS = 32000;

/**
 * Master switch for generating reports with Claude (subscription OAuth) instead
 * of the existing Gemini/lambda workflow. Read from `GENERATE_WITH_CLAUDE`:
 *   - `true`        → call Claude via `getClaudeStructuredResponse`.
 *   - unset/`false` → keep the previous workflow (`getLLMResponse`).
 *
 * NOTE: not named `use…` — ESLint's `react-hooks/rules-of-hooks` treats any
 * `use`-prefixed function as a React hook.
 */
export function shouldUseClaudeForReports(): boolean {
  return process.env.GENERATE_WITH_CLAUDE === 'true';
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

export interface ClaudeStructuredResponseOptions {
  invocationId: string;
  /** The fully-compiled prompt string (already built by the caller). */
  prompt: string;
  /** The parsed output JSON schema object the response is validated against. */
  outputSchema: object;
  maxRetries?: number;
  isTestInvocation?: boolean;
}

/**
 * Runs the Claude call for a report, validates the JSON against `outputSchema`,
 * marks the PromptInvocation Completed/Failed (same as `getLLMResponse`), and
 * returns the parsed result. Throws after exhausting `maxRetries`.
 */
export async function getClaudeStructuredResponse<Output>({
  invocationId,
  prompt,
  outputSchema,
  maxRetries = 2,
  isTestInvocation = false,
}: ClaudeStructuredResponseOptions): Promise<{ result: Output }> {
  const model = getDefaultClaudeModel();

  const finalPrompt =
    `${prompt}\n\n` +
    `Return ONLY a single valid JSON object that strictly conforms to the following JSON schema. ` +
    `Do not include any explanation, prose, comments, or markdown code fences — output raw JSON only.\n\n` +
    `JSON schema:\n${JSON.stringify(outputSchema)}`;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { text } = await callClaudeWithOAuth({
        prompt: finalPrompt,
        system: 'You are a precise data generator for financial reports. Output only valid JSON matching the requested schema — no prose, no markdown.',
        model,
        maxTokens: REPORT_MAX_TOKENS,
        // "high" effort per request; if a model/plan doesn't support it the call errors and we retry.
        effort: 'high',
      });

      const result = JSON.parse(extractJson(text)) as Output;

      const { valid, errors } = validateData(outputSchema, result);
      if (!valid) {
        throw new Error(`Claude output failed schema validation: ${JSON.stringify(errors)}`);
      }

      await updateInvocationStatus(invocationId, PromptInvocationStatus.Completed, { outputJson: JSON.stringify(result) }, isTestInvocation);
      return { result };
    } catch (err) {
      lastError = err;
      console.error(`[claude-structured] attempt ${attempt + 1}/${maxRetries + 1} failed:`, err);
      if (attempt === maxRetries) {
        await updateInvocationStatus(
          invocationId,
          PromptInvocationStatus.Failed,
          { error: err instanceof Error ? err.message : String(err) },
          isTestInvocation
        );
        throw err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  // Unreachable (the loop either returns or throws), but keeps TS happy.
  throw lastError instanceof Error ? lastError : new Error('Claude structured response failed');
}
