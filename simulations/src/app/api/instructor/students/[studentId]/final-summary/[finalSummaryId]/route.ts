import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';

interface DeleteResponse {
  message: string;
}

// DELETE /api/instructor/students/[studentId]/final-summary/[finalSummaryId]?caseStudyId=xxx - Delete a final summary
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ studentId: string; finalSummaryId: string }> }
): Promise<DeleteResponse> {
  const { studentId, finalSummaryId } = await params;
  const { searchParams } = new URL(req.url);
  const caseStudyId = searchParams.get('caseStudyId');
  const { userId } = userContext;

  if (!caseStudyId) {
    throw new Error('Case study ID is required');
  }

  // Verify user has instructor role
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (user.role !== 'Instructor') {
    throw new Error('Only instructors can delete final summaries');
  }

  // First verify instructor has access to this case study and student
  const student = await prisma.enrollmentStudent.findFirst({
    where: {
      id: studentId,
      archive: false,
      enrollment: {
        caseStudyId: caseStudyId,
        assignedInstructorId: userId,
        archive: false,
      },
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
    throw new Error('Student not found or you do not have access to this student');
  }

  // Verify instructor has access to this case study (skip for admin)
  if (user.role !== 'Instructor') {
    const hasAccess = student.enrollment.assignedInstructorId === userId;
    if (!hasAccess) {
      throw new Error('You do not have access to this student');
    }
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

export const DELETE = withLoggedInUser(deleteHandler);
