// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { geolocation } from '@vercel/functions';

const isISO2 = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z]{2}$/i.test(v);

export function middleware(req: NextRequest) {
  console.log('middleware', req.nextUrl.pathname);
  // geolocation() reads the same Vercel geo headers for you
  const { country } = geolocation(req as unknown as Request);

  const res = NextResponse.next();

  if (isISO2(country)) {
    res.cookies.set('country', country.toUpperCase(), {
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // must be readable by client JS
      maxAge: 60 * 60, // 1 hour
      secure: process.env.NODE_ENV !== 'development', // set in prod/preview
    });
  }

  return res;
}

export const config = { matcher: ['/stocks/:path*'] };
