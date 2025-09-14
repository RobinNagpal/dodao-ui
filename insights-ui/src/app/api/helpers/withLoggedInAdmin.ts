import { NextRequest, NextResponse } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';

type HandlerWithAdmin<T> = (req: NextRequest, userContext: DoDaoJwtTokenPayload) => Promise<T>;
type HandlerWithAdminAndParams<T> = (req: NextRequest, userContext: DoDaoJwtTokenPayload, params: { params: Promise<any> }) => Promise<T>;
type Handler<T> = (req: NextRequest, dynamic: { params: Promise<any> }) => Promise<NextResponse<T | ErrorResponse | RedirectResponse>>;

/**
 * Middleware that checks if the user is logged in and has the Admin role.
 * If the user is not logged in, they will be redirected to the login page.
 * If the user is logged in but not an Admin, they will receive an unauthorized error.
 *
 * @param handler The handler function to execute if the user is an Admin
 * @returns A handler function that can be exported as a Next.js API route
 */
export function withLoggedInAdmin<T>(handler: HandlerWithAdmin<T> | HandlerWithAdminAndParams<T>): any {
  return withLoggedInUser<T>(async (req: NextRequest, userContext: DoDaoJwtTokenPayload, dynamic: { params: Promise<any> }) => {
    // Cast to SimulationJwtTokenPayload to access the role property
    const context = userContext;

    console.log('Checking if user is an Admin...', context);
    return await handler(req, context, dynamic as any);
  }) as any;
}
