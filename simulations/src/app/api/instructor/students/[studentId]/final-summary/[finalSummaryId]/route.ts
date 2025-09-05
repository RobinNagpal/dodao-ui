import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface DeleteResponse {
  message: string;
}

// DELETE /api/instructor/students/[studentId]/final-summary/[finalSummaryId]?instructorEmail=xxx&caseStudyId=xxx - Delete a final summary
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ studentId: string; finalSummaryId: string }> }): Promise<DeleteResponse> {
  const { studentId, finalSummaryId } = await params;
  const { searchParams } = new URL(req.url);
  const instructorEmail = searchParams.get('instructorEmail');
  const caseStudyId = searchParams.get('caseStudyId');

  if (!instructorEmail) {
    throw new Error('Instructor email is required');
  }

  if (!caseStudyId) {
    throw new Error('Case study ID is required');
  }

  // First verify instructor has access to this case study and student
  const student = await prisma.enrollmentStudent.findFirst({
    where: {
      id: studentId,
      archive: false,
    },
    include: {
      enrollment: {
        include: {
          caseStudy: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Verify the case study matches
  if (student.enrollment.caseStudy.id !== caseStudyId) {
    throw new Error('Student does not belong to this case study');
  }

  // Verify instructor has access to this enrollment
  if (student.enrollment.assignedInstructorId !== instructorEmail) {
    throw new Error('You do not have access to this student');
  }

  // Find and delete the final summary
  const finalSummary = await prisma.finalSummary.findFirst({
    where: {
      id: finalSummaryId,
      studentId: studentId,
      archive: false,
    },
  });

  if (!finalSummary) {
    throw new Error('Final summary not found');
  }

  // Hard delete the final summary
  await prisma.finalSummary.delete({
    where: { id: finalSummaryId },
  });

  return {
    message: 'Final summary deleted successfully',
  };
}

export const DELETE = withErrorHandlingV2(deleteHandler);
