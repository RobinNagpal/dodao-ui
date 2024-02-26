import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  const params = new URL(decodeURIComponent(request.url)).searchParams;

  const headers = new Headers(request.headers);
  const spaceIdParam = params.get('spaceId');
  if (spaceIdParam) {
    headers.set('x-space-id', spaceIdParam);
  }

  const nextResponse = NextResponse.next({
    request: {
      headers: headers,
    },
  });
  // console.log('nextResponse.cookies', JSON.stringify(nextResponse.cookies.getAll()));
  // console.log('nextResponse.headers', JSON.stringify(Array.from(nextResponse.headers.entries()), null, 2));

  return nextResponse;
}

export const config = { matcher: ['/api/:path*'] };
