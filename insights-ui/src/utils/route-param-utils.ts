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
 * warnings, not errors. Pages log only plain-slug values (`isLoggableRejectedInput`); scanner
 * payloads 404 silently.
 */
export const INPUT_REJECTED_LOG_PREFIX = '[input-rejected]';

/**
 * A rejected value worth logging: a plain word or slug (`heavyElectricalEquipment`, `49-paper`) that
 * could come from a real link, e.g. an old URL. Anything else — quotes, `%`, slashes, dots, spaces
 * (SQL/XSS/template probes, `x.jsp`, `bxss.me`) — is a scanner payload: still a 404, but not logged.
 * Seven days of production rejections (issue #1768): ~4,900 lines, ~94% scanner payloads.
 */
const LOGGABLE_REJECTED_INPUT_PATTERN = /^[A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*$/;

/** True when a rejected value is a plain slug worth a log line (see LOGGABLE_REJECTED_INPUT_PATTERN). */
export function isLoggableRejectedInput(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.length <= MAX_LOGGED_INPUT_LENGTH && LOGGABLE_REJECTED_INPUT_PATTERN.test(value);
}

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
