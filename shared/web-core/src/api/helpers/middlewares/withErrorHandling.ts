import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextResponse, NextRequest } from 'next/server';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { capLogText } from '@dodao/web-core/api/helpers/adapters/capLogText';
import { DISCORD_POST_TIMEOUT_MS } from '@dodao/web-core/api/helpers/adapters/discordWebhook';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';

function isJwtError(error: unknown): boolean {
  const name = (error as any)?.name;
  return name === 'JsonWebTokenError' || name === 'TokenExpiredError' || name === 'NotBeforeError';
}

/**
 * Waits for `promise` but never longer than `ms`. Used so a slow/hung Discord webhook can't hold the
 * HTTP error response (the console line is written before the Discord post starts).
 */
async function awaitAtMost(promise: Promise<unknown>, ms: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms);
  });
  try {
    await Promise.race([promise.catch(() => undefined), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Logs a caught route error as ONE line: `[wrapper] METHOD URL -> status: Name: message | params=…` (+ stack).
 * Server errors go through logError (one console.error line + Discord). Expected client errors
 * (e.g. 404 not found) are a single console.warn line and are not posted to Discord.
 */
async function logRouteError(wrapperName: string, error: unknown, req: NextRequest, dynamic: { params: any }, statusCode: number): Promise<void> {
  let params: Record<string, any> = {};
  try {
    params = (await dynamic?.params) || {};
  } catch {
    // ignore - params are only used for logging
  }
  const err = error as any;
  // URL, message and params can carry attacker-controlled input (scanners send multi-KB
  // payloads), so each is capped. The line itself is never dropped.
  const summary = `[${wrapperName}] ${req.method} ${capLogText(req.url)} -> ${statusCode}: ${err?.name || 'Error'}: ${capLogText(
    String(err?.message ?? error)
  )}`;

  if (statusCode < 500 && !isJwtError(error)) {
    console.warn(Object.keys(params).length > 0 ? `${summary} | params=${capLogText(JSON.stringify(params))}` : summary);
    return;
  }

  // logError writes the console line synchronously, then awaits the Discord post (itself capped by an axios timeout).
  await awaitAtMost(logError(summary, params, error instanceof Error ? error : null), DISCORD_POST_TIMEOUT_MS);
}

/**
 * Status for a client error a handler threw on purpose, or undefined for anything else (callers then
 * fall back to 401 for JWT errors, else 500). Only errors WE build are trusted, so third-party errors that
 * carry their own `statusCode` (e.g. Stripe's StripeAuthenticationError = 401) stay a 500 and alert:
 * - `NotFoundError` (notFoundError()) → 404, `BadRequestError` (badRequestError()) → 400
 * - Prisma P2025 (findFirstOrThrow / findUniqueOrThrow found no record) → 404
 * - an error with `isClientError: true` and a numeric 4xx `statusCode` → that status
 */
function getClientErrorStatusCode(error: unknown): number | undefined {
  const err = error as any;
  if (err?.name === 'NotFoundError') return 404;
  if (err?.name === 'BadRequestError') return 400;
  if (err?.code === 'P2025') return 404;
  if (err?.isClientError === true && typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 500) return err.statusCode;
  return undefined;
}

type Handler<T> = (
  req: NextRequest,
  dynamic: { params: Promise<any> }
) => Promise<NextResponse<T | ErrorResponse | RedirectResponse>> | NextResponse<T | ErrorResponse>;

export function withErrorHandlingV1<T>(handler: Handler<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: Promise<any> }): Promise<NextResponse<T | ErrorResponse | RedirectResponse>> => {
    console.log('[withErrorHandlingV1] Handling request:', {
      url: capLogText(req.url),
      method: req.method,
      host: req.nextUrl.host,
      params: capLogText(JSON.stringify((await dynamic.params) ?? {})),
    });

    try {
      console.log('[withErrorHandlingV1] Executing handler function');
      const result = await handler(req, dynamic);
      console.log('[withErrorHandlingV1] Handler executed successfully, status:', result.status);
      return result;
    } catch (error) {
      const requestInfo = `host: ${req.nextUrl.host}, origin: ${req.nextUrl.origin}, url: ${req.url}, searchParams: ${req.nextUrl.searchParams.toString()}`;
      const errorData = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const message = `${errorData}. Error occurred while processing the request ${requestInfo}`;

      const statusCode = getClientErrorStatusCode(error) ?? (isJwtError(error) ? 401 : 500);
      await logRouteError('withErrorHandlingV1', error, req, dynamic, statusCode);
      return NextResponse.json({ error: message }, { status: statusCode });
    }
  };
}

type Handler2<T> = () => Promise<T>;
type Handler2WithReq<T> = (req: NextRequest) => Promise<T>;
type Handler2WithReqAndParams<T> = (req: NextRequest, dynamic: { params: any }) => Promise<T>;

export function withErrorHandlingV2<T>(handler: Handler2<T> | Handler2WithReq<T> | Handler2WithReqAndParams<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: any }): Promise<NextResponse<T | ErrorResponse>> => {
    console.log('[withErrorHandlingV2] Handling request:', {
      url: capLogText(req.url),
      method: req.method,
      host: req.nextUrl.host,
      params: capLogText(JSON.stringify((await dynamic.params) ?? {})),
    });

    try {
      console.log('[withErrorHandlingV2] Executing handler function');
      const result = await handler(req, dynamic);
      console.log('[withErrorHandlingV2] Handler executed successfully, returning JSON response with status 200');
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';

      // Expected client errors (badRequestError → 400, notFoundError / Prisma P2025 → 404) are a 4xx
      // warn instead of a 500 alert; everything else falls back to JWT → 401, else 500.
      const statusCode = getClientErrorStatusCode(error) ?? (isJwtError(error) ? 401 : 500);
      await logRouteError('withErrorHandlingV2', error, req, dynamic, statusCode);
      return NextResponse.json({ error: userMessage }, { status: statusCode });
    }
  };
}

type HandlerWithUser<T> = (req: NextRequest, userContext: DoDaoJwtTokenPayload) => Promise<T>;

type HandlerWithUserAndParams<T> = (req: NextRequest, userContext: DoDaoJwtTokenPayload, dynamic: { params: any }) => Promise<T>;

export function withLoggedInUser<T>(handler: HandlerWithUser<T> | HandlerWithUserAndParams<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: any }): Promise<NextResponse<T | ErrorResponse | RedirectResponse>> => {
    console.log('[withLoggedInUser] Handling request:', {
      url: capLogText(req.url),
      method: req.method,
      host: req.nextUrl.host,
      params: capLogText(JSON.stringify((await dynamic.params) ?? {})),
    });

    try {
      // Get the JWT token from the request
      const decodedJwt = await getDecodedJwtFromContext(req);
      if (!decodedJwt) {
        // Anonymous request (often a scanner): one warn line, no Discord alert.
        console.warn(`[withLoggedInUser] ${req.method} ${capLogText(req.url)} -> 307: no JWT token, redirecting to /login`);
        // Relative Location (RFC 7231 §7.1.2): the browser resolves it against the URL it actually
        // requested. `new URL('/login', req.url)` would use the host the server sees, which behind a
        // proxy / in a container is the internal one (e.g. ip-172-…ec2.internal:3000), not the public domain.
        return new NextResponse(null, { status: 307, headers: { Location: '/login' } }) as NextResponse<RedirectResponse>;
      }

      console.log('[withLoggedInUser] User found, executing handler function for user:', decodedJwt);
      const result = await handler(req, decodedJwt, dynamic);
      console.log('[withLoggedInUser] Handler executed successfully, returning JSON response with status 200');
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const statusCode = getClientErrorStatusCode(error) ?? (isJwtError(error) ? 401 : 500);
      await logRouteError('withLoggedInUser', error, req, dynamic, statusCode);
      return NextResponse.json({ error: userMessage }, { status: statusCode });
    }
  };
}
