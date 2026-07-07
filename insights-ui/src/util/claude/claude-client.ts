import Anthropic from '@anthropic-ai/sdk';

/**
 * Default Claude model for KoalaGains features. Opus 4.8 is Anthropic's most
 * capable Opus-tier model. Override with the `ANTHROPIC_MODEL` env var if a
 * different model is needed for a given deployment.
 */
export const DEFAULT_CLAUDE_MODEL = 'claude-opus-4-8';

let cachedClient: Anthropic | null = null;

/**
 * Returns a lazily-initialized, process-wide Anthropic client.
 *
 * The client reads its credentials from `ANTHROPIC_API_KEY`. We construct it
 * lazily (rather than at module load) so that importing this module in
 * environments without the key set — e.g. build-time page collection — doesn't
 * throw.
 */
export function getClaudeClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Set it before calling the Claude API.');
  }

  if (!cachedClient) {
    cachedClient = new Anthropic();
  }

  return cachedClient;
}

/**
 * Returns the Claude model to use, honoring the `ANTHROPIC_MODEL` override.
 */
export function getClaudeModel(): string {
  return process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
}
