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

  // You can also set request headers in NextResponse.rewrite
  return NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });
}
export const config = { matcher: ['/api/:path*'] };
