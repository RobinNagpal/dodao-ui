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

  // Get activity logs for this specific class enrollment
  // Now we can simply filter by classEnrollmentId
  const activityLogs = await prisma.userActivityLog.findMany({
    where: {
      classEnrollmentId: classEnrollmentId,
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
