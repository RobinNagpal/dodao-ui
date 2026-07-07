/**
 * Standalone test harness for {@link callClaudeWithOAuth}.
 *
 * Calls the Anthropic Messages API directly with your Claude subscription
 * OAuth token (using Claude Code spoofing headers) and prints the answer. This
 * is deliberately independent of the rest of the app so you can confirm the
 * OAuth path works before wiring it into any workflow.
 *
 * Usage:
 *   ANTHROPIC_OAUTH_TOKEN=sk-ant-oat... yarn claude:test-oauth "Your prompt here"
 *
 * The prompt can be passed as CLI args (joined) or falls back to a default.
 * Optional overrides via env: ANTHROPIC_MODEL, ANTHROPIC_BASE_URL, CLAUDE_CODE_VERSION.
 */
import { callClaudeWithOAuth } from '@/util/claude/claude-oauth-client';
import * as dotenv from 'dotenv';

dotenv.config();

async function main(): Promise<void> {
  const prompt = process.argv.slice(2).join(' ').trim() || 'In one sentence, what is a stock market index?';

  console.log('→ Sending prompt to Claude via OAuth subscription:');
  console.log(`   "${prompt}"\n`);

  const result = await callClaudeWithOAuth({ prompt });

  console.log('=== Answer ===');
  console.log(result.text);
  console.log('\n=== Meta ===');
  console.log(`model:       ${result.model}`);
  console.log(`stop_reason: ${result.stopReason}`);
  console.log(`tokens:      in=${result.usage.inputTokens} out=${result.usage.outputTokens}`);
}

main().catch((err) => {
  console.error('\n✗ Claude OAuth call failed:');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
