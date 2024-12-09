import { NextResponse, NextRequest } from 'next/server';
import { logError, logErrorRequest } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { ErrorResponse } from '@dodao/web-core/types/errors/ErrorResponse';

type Handler<T> = (req: NextRequest, dynamic: { params: any }) => Promise<NextResponse<T | ErrorResponse>> | NextResponse<T | ErrorResponse>;

export function withErrorHandlingV1<T>(handler: Handler<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: any }): Promise<NextResponse<T | ErrorResponse>> => {
    try {
      return await handler(req, dynamic);
    } catch (error) {
      const requestInfo = `host: ${req.nextUrl.host}, origin: ${req.nextUrl.origin}, url: ${req.url}, searchParams: ${req.nextUrl.searchParams.toString()}`;
      console.log('error for ', requestInfo);
      const message = (error as any)?.response?.data + `. Error occurred while processing the request  ${requestInfo}`;
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
