import { NextRequest, NextResponse } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { SimulationJwtTokenPayload } from '@/types/user';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';

type HandlerWithAdmin<T> = (req: NextRequest, userContext: SimulationJwtTokenPayload) => Promise<T>;
type HandlerWithAdminAndParams<T> = (req: NextRequest, userContext: SimulationJwtTokenPayload, dynamic: { params: any }) => Promise<T>;
type Handler<T> = (req: NextRequest, dynamic: { params: any }) => Promise<NextResponse<T | ErrorResponse | RedirectResponse>>;

/**
 * Middleware that checks if the user is logged in and has the Admin role.
 * If the user is not logged in, they will be redirected to the login page.
 * If the user is logged in but not an Admin, they will receive an unauthorized error.
 *
 * @param handler The handler function to execute if the user is an Admin
 * @returns A handler function that can be exported as a Next.js API route
 */
export function withLoggedInAdmin<T>(handler: HandlerWithAdmin<T> | HandlerWithAdminAndParams<T>): Handler<T> {
  return withLoggedInUser<T>(async (req: NextRequest, userContext: DoDaoJwtTokenPayload, dynamic: { params: any }) => {
    // Cast to SimulationJwtTokenPayload to access the role property
    const simulationUserContext = userContext as SimulationJwtTokenPayload;

    // Check if the user has the Admin role
    if (simulationUserContext.role !== 'Admin') {
      throw new Error('Unauthorized: Only admins can access this endpoint');
    }

    // If the user is an Admin, proceed with the handler function
    return await handler(req, simulationUserContext, dynamic);
  });
}
