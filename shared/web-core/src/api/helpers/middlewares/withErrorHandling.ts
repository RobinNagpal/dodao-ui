import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextResponse, NextRequest } from 'next/server';
import { logError, logErrorRequest } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';

function isJwtError(error: unknown): boolean {
  const name = (error as any)?.name;
  return name === 'JsonWebTokenError' || name === 'TokenExpiredError' || name === 'NotBeforeError';
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
  const summary = `[${wrapperName}] ${req.method} ${req.url} -> ${statusCode}: ${err?.name || 'Error'}: ${err?.message ?? String(error)}`;

  if (statusCode < 500 && !isJwtError(error)) {
    console.warn(Object.keys(params).length > 0 ? `${summary} | params=${JSON.stringify(params)}` : summary);
    return;
  }

  await logError(summary, params, error instanceof Error ? error : null);
}

type Handler<T> = (
  req: NextRequest,
  dynamic: { params: Promise<any> }
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
      const isPrismaNotFound = (error as any)?.code === 'P2025' || (error as any)?.name === 'NotFoundError';

      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';

      // Handlers can throw an error carrying an explicit `statusCode` (e.g. 404
      // for "resource not found") so an expected user error doesn't surface as a
      // generic 500. Falls back to the JWT/Prisma/500 detection below.
      const customStatusCode = typeof (error as any)?.statusCode === 'number' ? (error as any).statusCode : undefined;

      const statusCode = customStatusCode ?? (isJwtError(error) ? 401 : isPrismaNotFound ? 404 : 500);
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
      const statusCode = isJwtError(error) ? 401 : 500;
      await logRouteError('withLoggedInUser', error, req, dynamic, statusCode);
      return NextResponse.json({ error: userMessage }, { status: statusCode });
    }
  };
}
