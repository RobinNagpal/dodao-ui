import { ClaudeModel } from '@/types/llmConstants';

/**
 * Claude generation via the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`).
 *
 * This is the SUBSCRIPTION-backed path: it authenticates with a Claude Pro/Max subscription
 * through the `CLAUDE_CODE_OAUTH_TOKEN` environment variable (generated once with
 * `claude setup-token`), NOT a metered `ANTHROPIC_API_KEY`. It is the equivalent of running
 * `claude -p` headlessly inside the container.
 *
 * The Agent SDK is not a LangChain `BaseChatModel`, so it can't use `withStructuredOutput()`.
 * Instead we embed the JSON output schema in the prompt, ask for JSON only, and parse the
 * response. The caller (`getLLMResponse`) validates the parsed object against the same schema
 * and retries on failure, so a malformed/incomplete JSON reply is recovered by the existing
 * retry loop.
 */

/**
 * Extracts a JSON object from a model text response, tolerating markdown code fences and
 * incidental prose around the JSON.
 */
function parseJsonFromResponse<Output>(text: string): Output {
  let cleaned = text.trim();

  // Strip a surrounding ```json ... ``` (or ``` ... ```) fence if present.
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned) as Output;
  } catch {
    // Fall back to the first `{ ... }` span in case the model added leading/trailing prose.
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first !== -1 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1)) as Output;
    }
    throw new Error(`Failed to parse JSON from Claude Agent SDK response: ${text.slice(0, 500)}`);
  }
}

/**
 * Runs a single prompt through the Claude Agent SDK and returns the parsed structured output.
 *
 * @param prompt       The fully-compiled prompt (already includes any inputs/bodyToAppend).
 * @param model        Which Claude model to use.
 * @param outputSchema The JSON schema the response must conform to.
 */
export async function getClaudeAgentStructuredResponse<Output>(prompt: string, model: ClaudeModel, outputSchema: object): Promise<Output> {
  // Dynamic import keeps the SDK out of module-load / Docker-build time (mirrors the lazy-init
  // rule the Gemini clients follow — see docs/insights-ui/aws-deployment.md).
  const { query } = await import('@anthropic-ai/claude-agent-sdk');

  const schemaString = JSON.stringify(outputSchema, null, 2);
  const fullPrompt =
    `${prompt}\n\n` +
    `Respond with ONLY a single JSON object that strictly conforms to the JSON schema below. ` +
    `Do not include markdown code fences, explanations, or any text before or after the JSON.\n\n` +
    `JSON Schema:\n${schemaString}`;

  let responseText = '';

  for await (const message of query({
    prompt: fullPrompt,
    options: {
      model,
      // Non-interactive: never prompt for tool permissions inside the container.
      permissionMode: 'bypassPermissions',
      // Pure text-to-JSON generation — no coding-agent persona or filesystem context.
      systemPrompt: 'You are a financial data generation assistant. Follow the user instructions exactly and respond with only the requested JSON output.',
    },
  })) {
    if (message.type === 'result' && message.subtype === 'success') {
      responseText = message.result;
    }
  }

  if (!responseText) {
    throw new Error('Claude Agent SDK returned no successful result');
  }

  return parseJsonFromResponse<Output>(responseText);
}
