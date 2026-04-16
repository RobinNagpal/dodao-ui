import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { withLoggedInAdmin } from './withLoggedInAdmin';

const AUTOMATION_SECRET = process.env.AUTOMATION_SECRET || '';

type HandlerFn<T> = (req: NextRequest, dynamic: { params: Promise<any> }) => Promise<T>;

/**
 * Middleware that allows access either via:
 * 1. Normal admin login (JWT + Admin role), OR
 * 2. A secret token passed as `?token=<AUTOMATION_SECRET>` query param or `x-automation-token` header
 *
 * Use this for endpoints that need to be callable both from the admin UI and from automated scripts/skills.
 */
export function withAdminOrToken<T>(
  handler: (req: NextRequest, userContext: KoalaGainsJwtTokenPayload | null, params: { params: Promise<any> }) => Promise<T>
): any {
  // Build the admin-protected version for when there's no token
  const adminHandler = withLoggedInAdmin<T>((req: NextRequest, userContext: KoalaGainsJwtTokenPayload, params: { params: Promise<any> }) =>
    handler(req, userContext, params)
  );

  // Build the token-protected version
  const tokenHandler = withErrorHandlingV2<T>(async (req: NextRequest, dynamic: { params: Promise<any> }) => {
    return handler(req, null, dynamic);
  }) as HandlerFn<T>;

  return async (req: NextRequest, dynamic: { params: Promise<any> }): Promise<NextResponse<any>> => {
    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-automation-token') || '';

    if (AUTOMATION_SECRET && token === AUTOMATION_SECRET) {
      return tokenHandler(req, dynamic) as Promise<NextResponse<any>>;
    }

    // Fall back to admin auth
    return adminHandler(req, dynamic);
  };
}
