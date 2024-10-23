import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-api-key',
  ' Access-Control-Allow-Credentials': 'true',
};

export async function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  const headers = new Headers(request.headers);

  const nextResponse = NextResponse.next({
    request: {
      headers: headers,
    },
  });

  return nextResponse;
}

export const config = { matcher: ['/api/:path*'] };
