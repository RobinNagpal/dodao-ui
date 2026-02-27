import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUserAndActivityLog } from '@/middleware/withActivityLogging';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { DeleteResponse } from '@/types/api';
import { requireAdminOrInstructorUser } from '@/utils/user-utils';

// DELETE /api/instructor/students/[studentId]/attempts/[attemptId]?caseStudyId=xxx - Delete specific exercise attempt
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ studentId: string; attemptId: string }> }
): Promise<DeleteResponse> {
  const { studentId, attemptId } = await params;
  const { searchParams } = new URL(req.url);
  const caseStudyId = searchParams.get('caseStudyId');
  const { userId } = userContext;

  if (!caseStudyId) {
    throw new Error('Case study ID is required');
  }

  // Verify user has instructor or admin role
  const currentUser = await requireAdminOrInstructorUser(userId);

  // Build where clause - instructors can only access their own students, admins can access all
  const whereClause: any = {
    id: studentId,
    archive: false,
    enrollment: {
      caseStudyId: caseStudyId,
      archive: false,
    },
  };

  // Only filter by instructor ID if user is an instructor (admins can access all students)
  if (currentUser.role === 'Instructor') {
    whereClause.enrollment.assignedInstructorId = userId;
  }

  // Find the student with access check
  const student = await prisma.enrollmentStudent.findFirst({
    where: whereClause,
    include: {
      enrollment: {
        include: {
          caseStudy: {
            include: {
              modules: {
                where: { archive: false },
                include: {
                  exercises: {
                    where: { archive: false },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found or you do not have access to this student');
  }

  // Get all exercise IDs for this case study to verify the attempt belongs to this case study
  const allExerciseIds = student.enrollment.caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // Verify the attempt exists and belongs to this student and case study
  const attempt = await prisma.exerciseAttempt.findFirst({
    where: {
      id: attemptId,
      exerciseId: { in: allExerciseIds },
      createdById: student.assignedStudentId,
      archive: false,
    },
  });

  if (!attempt) {
    throw new Error('Exercise attempt not found or you do not have access to this attempt');
  }

  // Delete the specific attempt
  await prisma.exerciseAttempt.delete({
    where: {
      id: attemptId,
    },
  });

  return { message: 'Exercise attempt deleted successfully' };
}

export const DELETE = withLoggedInUserAndActivityLog<DeleteResponse>(deleteHandler);
