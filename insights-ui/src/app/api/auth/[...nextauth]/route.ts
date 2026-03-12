import { authOptions } from './authOptions';
import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

const nextAuthHandler = NextAuth(authOptions);

async function handler(req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) {
  try {
    return await nextAuthHandler(req, ctx);
  } catch (error) {
    console.error('[NextAuth] Unhandled error in auth handler:', error);
    return NextResponse.json({ error: 'Internal auth error' }, { status: 500 });
  }
}

export { handler as GET, handler as POST };
