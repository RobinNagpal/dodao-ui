import { NextResponse, NextRequest } from 'next/server';
import { logError, logErrorRequest } from '@/app/api/helpers/adapters/errorLogger';
import { ErrorResponse } from '@/types/response/ErrorResponse';

/**
 * @deprecated - use withErrorHandlingV1 instead
 */
export const withErrorHandling =
  (...handlers: Function[]) =>
  async (req: NextRequest, params: any): Promise<NextResponse<any>> => {
    try {
      let response;
      for (const handler of handlers) {
        response = await handler(req, params);
      }
      return response;
    } catch (error) {
      await logError((error as any)?.response?.data || 'an error occured', {}, error as any, null, null);
      await logErrorRequest(error as Error, req);
      return NextResponse.json({ message: (error as any)?.response?.data || 'an error occured' }, { status: 500 });
    }
  };

type Handler<T> = (req: NextRequest, dynamic: { params: any }) => Promise<NextResponse<T | ErrorResponse>> | NextResponse<T | ErrorResponse>;

export function withErrorHandlingV1<T>(handler: Handler<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: any }): Promise<NextResponse<T | ErrorResponse>> => {
    try {
      return await handler(req, dynamic);
    } catch (error) {
      const requestInfo = `host: ${req.nextUrl.host}, origin: ${req.nextUrl.origin}, url: ${req.url}, searchParams: ${req.nextUrl.searchParams.toString()}`;
      console.log('error for ', requestInfo);
      const message = (error as any)?.response?.data + `. Error occured while processing the request  ${requestInfo}`;
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
