import { isBlockedCrawler } from '@/utils/blocked-crawlers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rejects crawlers listed in `utils/blocked-crawlers.ts` before any page renders, so they
 * cost one cheap 403 instead of a full SSR fan-out. CloudFront forwards the viewer
 * User-Agent (AllViewer origin request policy), but its cache key ignores it — hence
 * `no-store`, so a bot's 403 is never cached and served to a real visitor.
 */
export function middleware(request: NextRequest): NextResponse {
  if (isBlockedCrawler(request.headers.get('user-agent'))) {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.next();
}

export const config = {
  // Skip static assets and robots.txt (blocked bots should still be able to read it).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
