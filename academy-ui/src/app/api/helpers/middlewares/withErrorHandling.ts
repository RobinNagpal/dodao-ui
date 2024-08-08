import { NextResponse, NextRequest } from 'next/server';
import { logError } from '@/app/api/helpers/adapters/errorLogger';

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
      return NextResponse.json({ message: 'An error occured' }, { status: 500 });
    }
  };
