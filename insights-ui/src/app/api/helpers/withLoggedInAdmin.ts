import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

type HandlerWithAdmin<T> = (req: NextRequest, userContext: KoalaGainsJwtTokenPayload) => Promise<T>;
type HandlerWithAdminAndParams<T> = (req: NextRequest, userContext: KoalaGainsJwtTokenPayload, params: { params: Promise<any> }) => Promise<T>;
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
    const koalaGainsUserContext = userContext as KoalaGainsJwtTokenPayload;

    if (!koalaGainsUserContext.role) {
      const user = await prisma.user.findUnique({
        where: {
          email_spaceId: {
            email: koalaGainsUserContext.email || koalaGainsUserContext.username,
            spaceId: koalaGainsUserContext.spaceId,
          },
        },
      });

      if (user?.role !== 'Admin') {
        throw new Error('Unauthorized: Only admins can access this endpoint');
      }
    } else {
      // Check if the user has the Admin role
      if (koalaGainsUserContext.role !== 'Admin') {
        throw new Error('Unauthorized: Only admins can access this endpoint');
      }
    }
    // If the user is an Admin, proceed with the handler function
    // Pass dynamic as params to match the HandlerWithAdminAndParams<T> type
    return await handler(req, koalaGainsUserContext, dynamic as any);
  }) as any;
}
