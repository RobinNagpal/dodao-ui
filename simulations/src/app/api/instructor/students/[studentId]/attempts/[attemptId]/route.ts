import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DeleteResponse } from '@/types/api';

// DELETE /api/instructor/students/[studentId]/attempts/[attemptId]?instructorEmail=xxx&caseStudyId=xxx - Delete specific exercise attempt
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ studentId: string; attemptId: string }> }): Promise<DeleteResponse> {
  const { studentId, attemptId } = await params;
  const { searchParams } = new URL(req.url);
  const instructorEmail = searchParams.get('instructorEmail');
  const caseStudyId = searchParams.get('caseStudyId');

  if (!instructorEmail) {
    throw new Error('Instructor email is required');
  }

  if (!caseStudyId) {
    throw new Error('Case study ID is required');
  }

  // First verify instructor has access to this student through the case study
  const student = await prisma.enrollmentStudent.findFirst({
    where: {
      id: studentId,
      archive: false,
      enrollment: {
        caseStudyId: caseStudyId,
        assignedInstructorId: instructorEmail,
        archive: false,
      },
    },
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
      createdBy: student.assignedStudentId,
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

export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
