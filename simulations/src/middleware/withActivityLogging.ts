import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextResponse, NextRequest } from 'next/server';
import { logError, logErrorRequest } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { ErrorResponse, RedirectResponse } from '@dodao/web-core/types/errors/ErrorResponse';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { UserRole } from '@prisma/client';
import { prisma } from '@/prisma';

// Import handler types from web-core
type Handler<T> = (
  req: NextRequest,
  dynamic: { params: Promise<any> }
) => Promise<NextResponse<T | ErrorResponse | RedirectResponse>> | NextResponse<T | ErrorResponse>;

type HandlerWithUser<T> = (req: NextRequest, userContext: DoDaoJwtTokenPayload) => Promise<T>;
type HandlerWithUserAndParams<T> = (req: NextRequest, userContext: DoDaoJwtTokenPayload, dynamic: { params: any }) => Promise<T>;

// Helper function to extract route pattern from URL
function extractRoutePattern(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Replace dynamic segments with parameter names, but be more intelligent
    const routePattern = pathname
      // Replace UUIDs with :id (most specific first)
      .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '/:id')
      // Replace numeric IDs with :id
      .replace(/\/\d+$/g, '/:id') // Only at the end of path
      .replace(/\/\d+\//g, '/:id/') // Or followed by more path segments
      // Replace other obvious ID patterns that are NOT meaningful path names
      // This should be very conservative to avoid replacing meaningful route segments
      .replace(/\/[a-f0-9]{20,}/g, '/:id') // Long hex strings (likely IDs)
      .replace(/\/[A-Za-z0-9]{24,}/g, '/:id'); // Very long alphanumeric strings (likely IDs)

    return routePattern;
  } catch {
    return url;
  }
}

// Helper function to safely stringify objects
function safeStringify(obj: any): string | null {
  try {
    if (obj === null || obj === undefined) {
      return null;
    }
    return JSON.stringify(obj);
  } catch {
    return null;
  }
}

/**
 * Enhanced wrapper that provides user authentication AND activity logging for simulations
 * - Logs user activities for POST, PUT, DELETE requests
 * - Skips logging for GET requests and admin users
 * - Logs activities for instructors and students
 */
export function withLoggedInUserAndActivityLog<T>(handler: HandlerWithUser<T> | HandlerWithUserAndParams<T>): Handler<T> {
  return async (req: NextRequest, dynamic: { params: Promise<any> }): Promise<NextResponse<T | ErrorResponse | RedirectResponse>> => {
    console.log('[withLoggedInUserAndActivityLog] Handling request:', {
      url: req.url,
      method: req.method,
      host: req.nextUrl.host,
      params: await dynamic.params,
    });

    // First, let's prepare activity logging variables
    let shouldLog = false;
    let userContext: DoDaoJwtTokenPayload | null = null;
    let requestBody: any = null;
    let responseData: any = null;
    let statusCode = 200;

    try {
      // Get the JWT token from the request
      const decodedJwt = await getDecodedJwtFromContext(req);
      if (!decodedJwt) {
        console.log('[withLoggedInUserAndActivityLog] No JWT token found, redirecting to login');
        await logErrorRequest(new Error('No JWT token found'), req);
        return NextResponse.redirect(new URL('/login', req.url), { status: 307 });
      }

      userContext = decodedJwt;

      // Determine if we should log this request
      const method = req.method.toUpperCase();

      // Get user's role from database
      const user = await prisma.user.findUnique({
        where: { id: userContext.userId },
        select: { role: true },
      });

      const userRole = user?.role || UserRole.Student;

      // Skip GET requests and admin users
      // Log only POST, PUT, DELETE requests from students and instructors
      shouldLog = method !== 'GET' && userRole !== UserRole.Admin;

      // Read request body if we're logging (for POST, PUT, DELETE)
      if (shouldLog && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
        try {
          // Clone the request to read the body without consuming it
          const bodyText = await req.clone().text();
          if (bodyText) {
            requestBody = JSON.parse(bodyText);
          }
        } catch (error) {
          console.log('[withLoggedInUserAndActivityLog] Could not parse request body:', error);
          requestBody = null;
        }
      }

      console.log('[withLoggedInUserAndActivityLog] User found, executing handler function for user:', decodedJwt);
      const result = await handler(req, decodedJwt, dynamic);

      console.log('[withLoggedInUserAndActivityLog] Handler executed successfully, returning JSON response with status 200');
      const jsonResponse = NextResponse.json(result, { status: 200 });
      statusCode = 200;
      responseData = result;

      // Log the activity if needed (do this after successful execution)
      if (shouldLog) {
        await logActivity({
          req,
          userContext,
          dynamic,
          requestBody,
          responseData,
          statusCode,
        });
      }

      return jsonResponse;
    } catch (error) {
      statusCode = 500;
      const requestInfo = `host: ${req.nextUrl.host}, origin: ${req.nextUrl.origin}, url: ${req.url}, searchParams: ${req.nextUrl.searchParams.toString()}`;
      console.error('[withLoggedInUserAndActivityLog] Error stack:', (error as any).stack);
      console.error('[withLoggedInUserAndActivityLog] Error caught:', error);
      console.error('[withLoggedInUserAndActivityLog] Request info:', requestInfo);
      console.error('[withLoggedInUserAndActivityLog] Request Params:', await dynamic.params);
      console.error('[withLoggedInUserAndActivityLog] Error name:', (error as any).name);
      console.error('[withLoggedInUserAndActivityLog] Error message:', (error as any).message);

      const errorData = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';
      const message = `${errorData}. Error occurred while processing the request ${requestInfo}`;
      console.log('[withLoggedInUserAndActivityLog] Logging error to system');
      await logError(message, {}, error as any, null, null);
      await logErrorRequest(error as Error, req);

      const userMessage = (error as any)?.response?.data || (error as any)?.message || 'An unknown error occurred';

      // Log the failed activity if needed
      if (shouldLog && userContext) {
        await logActivity({
          req,
          userContext,
          dynamic,
          requestBody,
          responseData: { error: userMessage },
          statusCode,
        });
      }

      console.log('[withLoggedInUserAndActivityLog] Returning user-friendly error message with status 500:', userMessage);
      return NextResponse.json({ error: userMessage }, { status: 500 });
    }
  };
}

// Helper function to log activity
async function logActivity({
  req,
  userContext,
  dynamic,
  requestBody,
  responseData,
  statusCode,
}: {
  req: NextRequest;
  userContext: DoDaoJwtTokenPayload;
  dynamic: { params: Promise<any> };
  requestBody: any;
  responseData: any;
  statusCode: number;
}) {
  try {
    const resolvedParams = await dynamic.params;
    const url = new URL(req.url);

    // Extract route pattern
    const routePattern = extractRoutePattern(req.url);

    // Extract path parameters from the resolved params
    const pathParams = resolvedParams ? safeStringify(resolvedParams) : null;

    // Extract query parameters
    const queryParams = url.searchParams.toString() ? safeStringify(Object.fromEntries(url.searchParams)) : null;

    // Create activity log entry using the simulations prisma instance
    await prisma.userActivityLog.create({
      data: {
        userId: userContext.userId,
        requestRoute: routePattern,
        requestMethod: req.method.toUpperCase(),
        requestPathParams: pathParams,
        requestQueryParams: queryParams,
        requestBody: safeStringify(requestBody),
        responseBody: safeStringify(responseData),
        status: statusCode,
      },
    });

    console.log('[withLoggedInUserAndActivityLog] Activity logged successfully');
  } catch (error) {
    console.error('[withLoggedInUserAndActivityLog] Failed to log activity:', error);
    // Don't throw - activity logging failure shouldn't break the API
  }
}
