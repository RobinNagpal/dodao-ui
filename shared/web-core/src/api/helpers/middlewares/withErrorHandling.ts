import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextResponse, NextRequest } from 'next/server';
import { logError, logErrorRequest } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';

function isJwtError(error: unknown): boolean {
  const name = (error as any)?.name;
  return name === 'JsonWebTokenError' || name === 'TokenExpiredError' || name === 'NotBeforeError';
}

const MAX_LOGGED_INPUT_CHARS = 500;

function capLogText(text: string): string {
  return text.length > MAX_LOGGED_INPUT_CHARS ? `${text.slice(0, MAX_LOGGED_INPUT_CHARS)}…(${text.length} chars)` : text;
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
    String(err?.message ?? error),
  )}`;

  if (statusCode < 500 && !isJwtError(error)) {
    console.warn(Object.keys(params).length > 0 ? `${summary} | params=${capLogText(JSON.stringify(params))}` : summary);
    return;
  }

  await logError(summary, params, error instanceof Error ? error : null);
}

/**
 * Status for an error a handler threw on purpose: an explicit numeric `statusCode` wins, then the
 * named client errors built by `@dodao/web-core/api/errors/*` (BadRequestError → 400,
 * NotFoundError → 404). Returns undefined for anything else, so callers fall back to their own mapping.
 */
function getExplicitStatusCode(error: unknown): number | undefined {
  const err = error as any;
  if (typeof err?.statusCode === 'number') return err.statusCode;
  if (err?.name === 'BadRequestError') return 400;
  if (err?.name === 'NotFoundError') return 404;
  return undefined;
}

type Handler<T> = (
  req: NextRequest,
  dynamic: { params: Promise<any> },
) => Promise<NextResponse<T | ErrorResponse | RedirectResponse>> | NextResponse<T | ErrorResponse>;

export function withErrorHandlingV1<T>(handler: Handler<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: Promise<any> }): Promise<NextResponse<T | ErrorResponse | RedirectResponse>> => {
    console.log('[withErrorHandlingV1] Handling request:', {
      url: req.url,
      method: req.method,
      host: req.nextUrl.host,
      params: await dynamic.params,
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

      const statusCode = isJwtError(error) ? 401 : 500;
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
      url: req.url,
      method: req.method,
      host: req.nextUrl.host,
      params: await dynamic.params,
    });

    try {
      console.log('[withErrorHandlingV2] Executing handler function');
      const result = await handler(req, dynamic);
      console.log('[withErrorHandlingV2] Handler executed successfully, returning JSON response with status 200');
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      // Check for Prisma "not found" error (P2025)
      const isPrismaNotFound = (error as any)?.code === 'P2025';

      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';

      // Handlers can throw an error carrying an explicit `statusCode` or a named
      // client error (badRequestError → 400, notFoundError → 404) so an expected
      // user error doesn't surface as a generic 500. Falls back to the
      // JWT/Prisma/500 detection below.
      const statusCode = getExplicitStatusCode(error) ?? (isJwtError(error) ? 401 : isPrismaNotFound ? 404 : 500);
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
      url: req.url,
      method: req.method,
      host: req.nextUrl.host,
      params: await dynamic.params,
    });

    try {
      // Get the JWT token from the request
      const decodedJwt = await getDecodedJwtFromContext(req);
      if (!decodedJwt) {
        console.log('[withLoggedInUser] No JWT token found, redirecting to login');
        await logErrorRequest(new Error('No JWT token found'), req);
        return NextResponse.redirect(new URL('/login', req.url), { status: 307 });
      }

      console.log('[withLoggedInUser] User found, executing handler function for user:', decodedJwt);
      const result = await handler(req, decodedJwt, dynamic);
      console.log('[withLoggedInUser] Handler executed successfully, returning JSON response with status 200');
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const statusCode = getExplicitStatusCode(error) ?? (isJwtError(error) ? 401 : 500);
      await logRouteError('withLoggedInUser', error, req, dynamic, statusCode);
      return NextResponse.json({ error: userMessage }, { status: statusCode });
    }
  };
}
