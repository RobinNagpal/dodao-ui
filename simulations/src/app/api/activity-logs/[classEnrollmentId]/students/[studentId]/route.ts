import { UserActivityLog, User } from '@prisma/client';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

export type ActivityLogWithUser = UserActivityLog & {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
};

export type StudentActivityLogsResponse = {
  logs: ActivityLogWithUser[];
  student: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ classEnrollmentId: string; studentId: string }> }
): Promise<StudentActivityLogsResponse> {
  const { classEnrollmentId, studentId } = await params;

  // studentId here is the EnrollmentStudent.id, we need to get the actual userId
  const enrollmentStudent = await prisma.enrollmentStudent.findUnique({
    where: { id: studentId },
    include: {
      assignedStudent: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!enrollmentStudent) {
    throw new Error('Student enrollment not found');
  }

  const userId = enrollmentStudent.assignedStudent.id;

  // Get activity logs for this specific student and class enrollment
  const activityLogs = await prisma.userActivityLog.findMany({
    where: {
      classEnrollmentId: classEnrollmentId,
      userId: userId,
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

  return {
    logs: activityLogs,
    student: {
      id: enrollmentStudent.assignedStudent.id,
      name: enrollmentStudent.assignedStudent.name,
      email: enrollmentStudent.assignedStudent.email,
    },
  };
}

export const GET = withLoggedInUser<StudentActivityLogsResponse>(getHandler);
