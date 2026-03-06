import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { ActivityLogsResponse } from '@/types/api';

async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ classEnrollmentId: string }> }
): Promise<ActivityLogsResponse> {
  const { classEnrollmentId } = await params;

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.max(1, Math.min(500, parseInt(url.searchParams.get('limit') || '100')));
  const skip = (page - 1) * limit;

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
        where: { archive: false },
        select: {
          assignedStudent: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  // Get user IDs for separating logs
  const studentUserIds = enrollment.students.map((s) => s.assignedStudent.id);
  const instructorUserId = enrollment.assignedInstructor.id;

  const whereClause = { classEnrollmentId };
  const includeUser = { user: { select: { id: true, email: true, name: true, role: true as const } } };

  const [activityLogs, totalLogs] = await Promise.all([
    prisma.userActivityLog.findMany({
      where: whereClause,
      include: includeUser,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.userActivityLog.count({ where: whereClause }),
  ]);

  // Separate logs by user type
  const instructorLogs = activityLogs.filter((log) => log.userId === instructorUserId);
  const studentLogs = activityLogs.filter((log) => studentUserIds.includes(log.userId));

  const totalPages = Math.ceil(totalLogs / limit);

  return {
    instructorLogs,
    studentLogs,
    allLogs: activityLogs,
    totalLogs,
    page,
    limit,
    totalPages,
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
