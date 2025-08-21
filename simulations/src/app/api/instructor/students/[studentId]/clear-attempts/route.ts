import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DeleteResponse } from '@/types/api';

// DELETE /api/instructor/students/[studentId]/clear-attempts?instructorEmail=xxx&caseStudyId=xxx - Clear all attempts and final submission for a student
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }): Promise<DeleteResponse> {
  const { studentId } = await params;
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
      finalSubmission: true,
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
      createdBy: student.assignedStudentId,
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

  return { message: 'Student attempts and final submission cleared successfully' };
}

export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
