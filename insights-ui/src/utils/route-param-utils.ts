// Shared helpers for validating dynamic route params and logging rejected (often attacker-controlled)
// input. Pure: no logging or navigation side effects, so they are safe in `generateMetadata`, API
// routes and server components alike.

/** Max characters of user-supplied input written to a log line (scanners send multi-KB payloads). */
export const MAX_LOGGED_INPUT_LENGTH = 100;

/**
 * Decode a URI-encoded route param. Returns undefined for malformed encodings (e.g. a lone `%`),
 * which make `decodeURIComponent` throw.
 */
export function safeDecodeParam(raw: string): string | undefined {
  try {
    return decodeURIComponent(raw);
  } catch {
    return undefined;
  }
}

/** Truncate input for a log line and JSON-quote it, so control characters and quotes stay escaped. */
export function truncateForLog(text: string): string {
  return JSON.stringify(text.slice(0, MAX_LOGGED_INPUT_LENGTH));
}

/**
 * Prefix on every log line for input rejected by a format check (route params, query params), so
 * they can be found together: `pnpm logs:fetch --level warn --grep input-rejected`. These are
 * warnings, not errors: the input is malformed, typically from scanners/bots.
 */
export const INPUT_REJECTED_LOG_PREFIX = '[input-rejected]';

/** Inputs longer than this are rejected before the pattern is even tried. */
const MAX_VALIDATED_INPUT_LENGTH = 200;

/** True when `value` is present, not over-long, and fully matches `pattern` (anchor it with ^…$). */
export function matchesInputPattern(value: string | null | undefined, pattern: RegExp): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_VALIDATED_INPUT_LENGTH && pattern.test(value);
}

/**
 * The one log message for a rejected input: `[input-rejected] <scope>: invalid <name> "<value…>"`.
 * API routes throw `notFoundError(inputRejectedMessage(...))` (the error wrapper logs it once as a
 * warn); pages `console.warn` it and call `notFound()`.
 */
export function inputRejectedMessage(scope: string, name: string, value: string | null | undefined): string {
  return `${INPUT_REJECTED_LOG_PREFIX} ${scope}: invalid ${name} ${truncateForLog(String(value ?? ''))}`;
}
