import { NextRequest, NextResponse } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { SimulationJwtTokenPayload } from '@/types/user';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';
import { prisma } from '@/prisma';

type HandlerWithAdmin<T> = (req: NextRequest, userContext: SimulationJwtTokenPayload) => Promise<T>;
type HandlerWithAdminAndParams<T> = (req: NextRequest, userContext: SimulationJwtTokenPayload, params: { params: Promise<any> }) => Promise<T>;
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
    const simulationUserContext = userContext as SimulationJwtTokenPayload;

    if (!simulationUserContext.role) {
      const user = await prisma.user.findUnique({
        where: {
          email_spaceId: {
            email: simulationUserContext.email || simulationUserContext.username,
            spaceId: simulationUserContext.spaceId,
          },
        },
      });

      if (user?.role !== 'Admin') {
        throw new Error('Unauthorized: Only admins can access this endpoint');
      }
    } else {
      // Check if the user has the Admin role
      if (simulationUserContext.role !== 'Admin') {
        throw new Error('Unauthorized: Only admins can access this endpoint');
      }
    }
    // If the user is an Admin, proceed with the handler function
    // Pass dynamic as params to match the HandlerWithAdminAndParams<T> type
    return await handler(req, simulationUserContext, dynamic as any);
  }) as any;
}
