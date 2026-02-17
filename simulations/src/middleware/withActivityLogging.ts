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

// Helper function to safely get JSON-serializable object
function safeJsonObject(obj: any): any | null {
  try {
    if (obj === null || obj === undefined) {
      return null;
    }
    // Ensure the object is JSON-serializable by round-tripping through JSON
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return null;
  }
}

/**
 * Extracts classEnrollmentId from various sources based on the route pattern
 * Priority:
 * 1. Path params (classEnrollmentId)
 * 2. Student lookup via studentId (path or body) -> enrollmentId
 * 3. Exercise lookup via exerciseId -> caseStudy -> first instructor enrollment
 * 4. User lookup via targetUserId -> first enrollment (for sign-in-code)
 */
async function extractClassEnrollmentId(pathParams: any, queryParams: URLSearchParams, requestBody: any, userId: string): Promise<string | null> {
  try {
    // 1. Check if classEnrollmentId is directly in path params
    if (pathParams?.classEnrollmentId) {
      return pathParams.classEnrollmentId;
    }

    // 2. Check for studentId (EnrollmentStudent.id) in path params or body
    const studentId = pathParams?.studentId || requestBody?.studentId;
    if (studentId) {
      const student = await prisma.enrollmentStudent.findUnique({
        where: { id: studentId },
        select: { enrollmentId: true },
      });
      if (student?.enrollmentId) {
        return student.enrollmentId;
      }
    }

    // 3. Check for exerciseId in path params - get enrollment via exercise -> module -> caseStudy
    const exerciseId = pathParams?.exerciseId;
    if (exerciseId) {
      const exercise = await prisma.moduleExercise.findUnique({
        where: { id: exerciseId },
        select: {
          module: {
            select: {
              caseStudy: {
                select: {
                  enrollments: {
                    where: {
                      archive: false,
                      assignedInstructorId: userId,
                    },
                    select: { id: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
      // For instructor: get their enrollment for this case study
      if (exercise?.module?.caseStudy?.enrollments?.[0]?.id) {
        return exercise.module.caseStudy.enrollments[0].id;
      }
      // For student: get their enrollment through EnrollmentStudent
      const studentEnrollment = await prisma.enrollmentStudent.findFirst({
        where: {
          assignedStudentId: userId,
          archive: false,
          enrollment: {
            caseStudy: {
              modules: {
                some: {
                  exercises: {
                    some: { id: exerciseId },
                  },
                },
              },
            },
          },
        },
        select: { enrollmentId: true },
      });
      if (studentEnrollment?.enrollmentId) {
        return studentEnrollment.enrollmentId;
      }
    }

    // 4. Check for caseStudyId in path params or query params - get enrollment for this user
    const caseStudyId = pathParams?.caseStudyId || queryParams.get('caseStudyId');
    if (caseStudyId) {
      // For instructor
      const instructorEnrollment = await prisma.classCaseStudyEnrollment.findFirst({
        where: {
          caseStudyId,
          assignedInstructorId: userId,
          archive: false,
        },
        select: { id: true },
      });
      if (instructorEnrollment?.id) {
        return instructorEnrollment.id;
      }
      // For student
      const studentEnrollment = await prisma.enrollmentStudent.findFirst({
        where: {
          assignedStudentId: userId,
          archive: false,
          enrollment: {
            caseStudyId,
            archive: false,
          },
        },
        select: { enrollmentId: true },
      });
      if (studentEnrollment?.enrollmentId) {
        return studentEnrollment.enrollmentId;
      }
    }

    // 5. For sign-in-code route or other routes - check if target user (id param) has an enrollment
    const targetUserId = pathParams?.id;
    if (targetUserId) {
      // First check if target user is a student in any enrollment
      const targetStudentEnrollment = await prisma.enrollmentStudent.findFirst({
        where: {
          assignedStudentId: targetUserId,
          archive: false,
        },
        select: { enrollmentId: true },
        orderBy: { createdAt: 'desc' },
      });
      if (targetStudentEnrollment?.enrollmentId) {
        return targetStudentEnrollment.enrollmentId;
      }
    }

    return null;
  } catch (error) {
    console.error('[extractClassEnrollmentId] Error extracting classEnrollmentId:', error);
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
        const resolvedParams = await dynamic.params;
        const url = new URL(req.url);
        const classEnrollmentId = await extractClassEnrollmentId(resolvedParams, url.searchParams, requestBody, userContext.userId);
        await logActivity({
          req,
          userContext,
          dynamic,
          requestBody,
          responseData,
          statusCode,
          classEnrollmentId,
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
        const resolvedParams = await dynamic.params;
        const url = new URL(req.url);
        const classEnrollmentId = await extractClassEnrollmentId(resolvedParams, url.searchParams, requestBody, userContext.userId);
        await logActivity({
          req,
          userContext,
          dynamic,
          requestBody,
          responseData: { error: userMessage },
          statusCode,
          classEnrollmentId,
          errorMessage: (error as any)?.message || userMessage,
          errorDetails: {
            name: (error as any)?.name || null,
            code: (error as any)?.code || null,
            stack: (error as any)?.stack || null,
          },
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
  classEnrollmentId = null,
  errorMessage = null,
  errorDetails = null,
}: {
  req: NextRequest;
  userContext: DoDaoJwtTokenPayload;
  dynamic: { params: Promise<any> };
  requestBody: any;
  responseData: any;
  statusCode: number;
  classEnrollmentId?: string | null;
  errorMessage?: string | null;
  errorDetails?: any | null;
}) {
  try {
    const resolvedParams = await dynamic.params;
    const url = new URL(req.url);

    // Extract route pattern
    const routePattern = extractRoutePattern(req.url);

    // Extract path parameters from the resolved params
    const pathParams = resolvedParams ? safeJsonObject(resolvedParams) : null;

    // Extract query parameters
    const queryParams = url.searchParams.toString() ? safeJsonObject(Object.fromEntries(url.searchParams)) : null;

    // Create activity log entry using the simulations prisma instance
    await prisma.userActivityLog.create({
      data: {
        userId: userContext.userId,
        classEnrollmentId,
        requestRoute: routePattern,
        requestMethod: req.method.toUpperCase(),
        requestPathParams: pathParams,
        requestQueryParams: queryParams,
        requestBody: safeJsonObject(requestBody),
        responseBody: safeJsonObject(responseData),
        status: statusCode,
        errorMessage,
        errorDetails,
      },
    });

    console.log('[withLoggedInUserAndActivityLog] Activity logged successfully');
  } catch (error) {
    console.error('[withLoggedInUserAndActivityLog] Failed to log activity:', error);
    // Don't throw - activity logging failure shouldn't break the API
  }
}
