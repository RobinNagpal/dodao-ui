import { UserActivityLog, User } from '@prisma/client';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export type ActivityLogWithUser = UserActivityLog & {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
};

export type ActivityLogsResponse = {
  instructorLogs: ActivityLogWithUser[];
  studentLogs: ActivityLogWithUser[];
  enrollment: {
    id: string;
    className: string;
    caseStudy: {
      id: string;
      title: string;
    };
    assignedInstructor: Pick<User, 'id' | 'email' | 'name'>;
  } | null;
};

async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ classEnrollmentId: string }> }
): Promise<ActivityLogsResponse> {
  const { classEnrollmentId } = await params;

  // Get enrollment details
  const enrollment = await prisma.classCaseStudyEnrollment.findUnique({
    where: { id: classEnrollmentId },
    include: {
      caseStudy: {
        select: { id: true, title: true },
      },
      assignedInstructor: {
        select: { id: true, email: true, name: true },
      },
      students: {
        select: {
          assignedStudent: {
            select: { id: true },
          },
          createdAt: true,
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  // Get all user IDs related to this enrollment
  const studentUserIds = enrollment.students.map((s) => s.assignedStudent.id);
  const instructorUserId = enrollment.assignedInstructor.id;
  const allUserIds = [...studentUserIds, instructorUserId];

  // Get the case study ID for filtering
  const caseStudyId = enrollment.caseStudy.id;
  const enrollmentCreatedAt = enrollment.createdAt;

  // Get activity logs for all users related to this enrollment
  // Filter by:
  // 1. Users in this enrollment
  // 2. Logs created after enrollment creation date
  // 3. For instructor: only logs that might be related to this case study
  const activityLogs = await prisma.userActivityLog.findMany({
    where: {
      userId: { in: allUserIds },
      createdAt: { gte: enrollmentCreatedAt },
      OR: [
        // Student logs - all logs after they joined this enrollment
        { userId: { in: studentUserIds } },
        // Instructor logs - filter by routes that might contain case study context
        {
          userId: instructorUserId,
          OR: [
            { requestRoute: { contains: caseStudyId } },
            { requestPathParams: { contains: caseStudyId } },
            { requestQueryParams: { contains: caseStudyId } },
            { requestBody: { contains: caseStudyId } },
            { responseBody: { contains: caseStudyId } },
            // Include common instructor routes that might be related to enrollment management
            { requestRoute: { contains: '/enrollments' } },
            { requestRoute: { contains: '/students' } },
          ],
        },
      ],
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Separate logs by user type
  const instructorLogs = activityLogs.filter((log) => log.userId === instructorUserId);
  const studentLogs = activityLogs.filter((log) => studentUserIds.includes(log.userId));

  return {
    instructorLogs,
    studentLogs,
    enrollment: {
      id: enrollment.id,
      className: enrollment.className,
      caseStudy: {
        id: enrollment.caseStudy.id,
        title: enrollment.caseStudy.title,
      },
      assignedInstructor: enrollment.assignedInstructor,
    },
  };
}

export const GET = withLoggedInUser<ActivityLogsResponse>(getHandler);
