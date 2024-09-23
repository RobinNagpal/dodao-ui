import { NextResponse, NextRequest } from 'next/server';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { ErrorResponse } from '@/types/response/ErrorResponse';

/**
 * @deprecated - use withErrorHandlingV1 instead
 */
export const withErrorHandling =
  (...handlers: Function[]) =>
  async (req: NextRequest, res: NextResponse) => {
    try {
      let response;
      for (const handler of handlers) {
        response = await handler(req, res);
      }
      return response;
    } catch (error) {
      await logError((error as any)?.response?.data || 'an error occured', {}, error as any, null, null);
      return NextResponse.json({ message: (error as any)?.response?.data || 'an error occured' }, { status: 500 });
    }
  };

type Handler<T> = (req: NextRequest, dynamic: { params: any }) => Promise<NextResponse<T | ErrorResponse>> | NextResponse<T | ErrorResponse>;

export function withErrorHandlingV1<T>(handler: Handler<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: any }): Promise<NextResponse<T | ErrorResponse>> => {
    try {
      return await handler(req, dynamic);
    } catch (error) {
      await logError((error as any)?.response?.data || 'an error occured', {}, error as any, null, null);
      return NextResponse.json({ error: (error as any)?.response?.data || 'an error occured' }, { status: 500 });
    }
  };
}
