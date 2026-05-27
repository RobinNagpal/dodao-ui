import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextResponse, NextRequest } from 'next/server';
import { logError, logErrorRequest } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';

function isJwtError(error: unknown): boolean {
  const name = (error as any)?.name;
  return name === 'JsonWebTokenError' || name === 'TokenExpiredError' || name === 'NotBeforeError';
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
      console.error('[withErrorHandlingV1] Error stack:', (error as any).stack);
      console.error('[withErrorHandlingV1] Error caught:', error);
      console.error('[withErrorHandlingV1] Request info:', requestInfo);
      console.error('[withErrorHandlingV1] Request Params:', await dynamic.params);
      console.error('[withErrorHandlingV1] Error name:', (error as any).name);
      console.error('[withErrorHandlingV1] Error message:', (error as any).message);

      const errorData = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const message = `${errorData}. Error occurred while processing the request ${requestInfo}`;
      console.log('[withErrorHandlingV1] Logging error to system');
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);

      const statusCode = isJwtError(error) ? 401 : 500;
      console.log(`[withErrorHandlingV1] Returning error response with status ${statusCode}`);
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
      const requestInfo = `host: ${req.nextUrl.host}, origin: ${req.nextUrl.origin}, url: ${req.url}, searchParams: ${req.nextUrl.searchParams.toString()}`;
      console.error('[withErrorHandlingV2] Error stack:', (error as any).stack);
      console.error('[withErrorHandlingV2] Error caught:', error);
      console.error('[withErrorHandlingV2] Request info:', requestInfo);
      console.error('[withErrorHandlingV2] Request Params:', await dynamic.params);
      console.error('[withErrorHandlingV2] Error name:', (error as any).name);
      console.error('[withErrorHandlingV2] Error message:', (error as any).message);

      // Check for Prisma "not found" error (P2025)
      const isPrismaNotFound = (error as any)?.code === 'P2025' || (error as any)?.name === 'NotFoundError';

      const errorData = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const message = `${errorData}. Error occurred while processing the request ${requestInfo}`;
      console.log('[withErrorHandlingV2] Logging error to system');
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);

      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';

      const statusCode = isJwtError(error) ? 401 : isPrismaNotFound ? 404 : 500;
      console.log(`[withErrorHandlingV2] Returning user-friendly error message with status ${statusCode}:`, userMessage);
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
      const requestInfo = `host: ${req.nextUrl.host}, origin: ${req.nextUrl.origin}, url: ${req.url}, searchParams: ${req.nextUrl.searchParams.toString()}`;
      console.error('[withLoggedInUser] Error stack:', (error as any).stack);
      console.error('[withLoggedInUser] Error caught:', error);
      console.error('[withLoggedInUser] Request info:', requestInfo);
      console.error('[withLoggedInUser] Request Params:', await dynamic.params);
      console.error('[withLoggedInUser] Error name:', (error as any).name);
      console.error('[withLoggedInUser] Error message:', (error as any).message);

      const errorData = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const message = `${errorData}. Error occurred while processing the request ${requestInfo}`;
      console.log('[withLoggedInUser] Logging error to system');
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);

      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const statusCode = isJwtError(error) ? 401 : 500;
      console.log(`[withLoggedInUser] Returning user-friendly error message with status ${statusCode}:`, userMessage);
      return NextResponse.json({ error: userMessage }, { status: statusCode });
    }
  };
}
