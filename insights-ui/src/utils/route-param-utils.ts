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
