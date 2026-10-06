/**
 * Builds an error that the shared error-handling middleware maps to a clean 404 response.
 *
 * The shared wrappers (V1, V2, withLoggedInUser) return a 404 for `error.name === "NotFoundError"`. Throwing this from an
 * API handler (instead of relying on Prisma's `findUniqueOrThrow` / `findFirstOrThrow`) keeps internal
 * Prisma details — model and method names — out of the response body, and gives clients a clean,
 * intentional not-found message.
 */
export function notFoundError(message: string): Error {
  const error = new Error(message);
  error.name = 'NotFoundError';
  return error;
}
