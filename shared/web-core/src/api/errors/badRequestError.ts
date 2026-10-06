/**
 * Builds an error that the shared error-handling middleware maps to a clean 400 response.
 *
 * Throw this from an API handler when a query param or body field the route actually uses has an
 * invalid value (e.g. a non-numeric `page`), instead of letting the bad value reach Prisma and surface
 * as a 500. The middleware logs it as a single `console.warn` line and does not post it to Discord.
 */
export function badRequestError(message: string): Error {
  const error = new Error(message) as Error & { statusCode: number };
  error.name = 'BadRequestError';
  error.statusCode = 400;
  return error;
}
