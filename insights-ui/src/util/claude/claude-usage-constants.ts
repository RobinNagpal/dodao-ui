import { ClaudeModel } from '@/types/llmConstants';

/**
 * Fixed knobs for the Claude-usage-gated report auto-generation job.
 *
 * The usage gates (5-hour limit + weekly day-curve) and the batch size now vary
 * by the `AUTOMATED_GENERATION_MODE` setting — see `AUTO_GEN_MODE_PRESETS` in
 * `auto-gen-modes.ts`. Only the model, which is the same across modes, lives here.
 */
export const CLAUDE_AUTO_GEN = {
  /**
   * Claude model used for the auto-generated reports (this job only). Change it
   * here to switch models without touching the logic; value comes from the shared
   * ClaudeModel enum. The provider is always Claude (subscription OAuth path).
   */
  LLM_MODEL: ClaudeModel.CLAUDE_SONNET_4_6,
} as const;
