/** Default cap for request-derived text (URL, error message, params) in log lines. */
export const MAX_LOGGED_INPUT_CHARS = 500;

/**
 * Caps text that may carry attacker-controlled input before it is written to a log line.
 * Scanners send multi-KB payloads, so the line is shortened, never dropped. The original length is kept.
 */
export function capLogText(text: string, max: number = MAX_LOGGED_INPUT_CHARS): string {
  return text.length > max ? `${text.slice(0, max)}…(${text.length} chars)` : text;
}
