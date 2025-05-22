import { NextResponse, NextRequest } from 'next/server';
import { logError, logErrorRequest } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { ErrorResponse } from '@dodao/web-core/types/errors/ErrorResponse';

type Handler<T> = (req: NextRequest, dynamic: { params: Promise<any> }) => Promise<NextResponse<T | ErrorResponse>> | NextResponse<T | ErrorResponse>;

export function withErrorHandlingV1<T>(handler: Handler<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: Promise<any> }): Promise<NextResponse<T | ErrorResponse>> => {
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
      console.error('[withErrorHandlingV1] Error caught:', error);
      console.error('[withErrorHandlingV1] Request info:', requestInfo);
      console.error('[withErrorHandlingV1] Request Params:', await dynamic.params);
      console.error('[withErrorHandlingV1] Error name:', (error as any).name);
      console.error('[withErrorHandlingV1] Error message:', (error as any).message);
      console.error('[withErrorHandlingV1] Error stack:', (error as any).stack);

      const message = (error as any)?.response?.data + `. Error occurred while processing the request  ${requestInfo}`;
      console.log('[withErrorHandlingV1] Logging error to system');
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);

      console.log('[withErrorHandlingV1] Returning error response with status 500');
      return NextResponse.json({ error: message }, { status: 500 });
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
      console.error('[withErrorHandlingV2] Error caught:', error);
      console.error('[withErrorHandlingV2] Request info:', requestInfo);
      console.error('[withErrorHandlingV2] Request Params:', await dynamic.params);
      console.error('[withErrorHandlingV2] Error name:', (error as any).name);
      console.error('[withErrorHandlingV2] Error message:', (error as any).message);
      console.error('[withErrorHandlingV2] Error stack:', (error as any).stack);

      const message = (error as any)?.response?.data + `. Error occurred while processing the request  ${requestInfo}`;
      console.log('[withErrorHandlingV2] Logging error to system');
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);

      const userMessage = (error as any)?.response?.data || (error as any)?.message;
      console.log('[withErrorHandlingV2] Returning user-friendly error message with status 500:', userMessage);
      return NextResponse.json({ error: userMessage }, { status: 500 });
    }
  };
}
