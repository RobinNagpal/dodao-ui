import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUserAndActivityLog } from '@/middleware/withActivityLogging';
import { DeleteResponse } from '@/types/api';
import { requireAdminOrInstructorUser } from '@/utils/user-utils';

// DELETE /api/instructor/students/[studentId]/clear-attempts?caseStudyId=xxx - Clear all attempts, final submission, and final summary for a student
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ studentId: string }> }
): Promise<DeleteResponse> {
  const { studentId } = await params;
  const { searchParams } = new URL(req.url);
  const caseStudyId = searchParams.get('caseStudyId');
  const { userId } = userContext;

  if (!caseStudyId) {
    throw new Error('Case study ID is required');
  }

  // Verify user has instructor or admin role
  const user = await requireAdminOrInstructorUser(userId);

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
  if (user.role === 'Instructor') {
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
      finalSubmission: true,
      finalSummary: true,
    },
  });

  if (!student) {
    throw new Error('Student not found or you do not have access to this student');
  }

  // Get all exercise IDs for this case study
  const allExerciseIds = student.enrollment.caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // Delete all exercise attempts for this student in this case study
  const deleteAttemptsResult = await prisma.exerciseAttempt.deleteMany({
    where: {
      exerciseId: { in: allExerciseIds },
      createdById: student.assignedStudentId,
    },
  });

  // Delete final submission if exists
  let deletedFinalSubmission = false;
  if (student.finalSubmission) {
    await prisma.finalSubmission.delete({
      where: {
        id: student.finalSubmission.id,
      },
    });
    deletedFinalSubmission = true;
  }

  // Delete final summary if exists
  let deletedFinalSummary = false;
  if (student.finalSummary) {
    await prisma.finalSummary.delete({
      where: {
        id: student.finalSummary.id,
      },
    });
    deletedFinalSummary = true;
  }

  return { message: 'Student attempts, final submission, and final summary cleared successfully' };
}

export const DELETE = withLoggedInUserAndActivityLog<DeleteResponse>(deleteHandler);
