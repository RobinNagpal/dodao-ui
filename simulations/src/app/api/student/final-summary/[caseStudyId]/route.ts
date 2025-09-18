import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2, withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface FinalSummaryResponse {
  id: string;
  response: string | null;
  status: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// GET /api/student/final-summary/[caseStudyId] - Get existing final summary for student
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<FinalSummaryResponse | null> {
  const { caseStudyId } = await params;

  // Find the enrollment student record
  const enrollmentStudent = await prisma.enrollmentStudent.findFirst({
    where: {
      assignedStudentId: userContext.userId,
      enrollment: {
        caseStudyId: caseStudyId,
        archive: false,
      },
      archive: false,
    },
    include: {
      finalSummary: true,
    },
  });

  if (!enrollmentStudent) {
    throw new Error('Student not enrolled in this case study');
  }

  if (!enrollmentStudent.finalSummary) {
    return null;
  }

  return {
    id: enrollmentStudent.finalSummary.id,
    response: enrollmentStudent.finalSummary.response,
    status: enrollmentStudent.finalSummary.status,
    error: enrollmentStudent.finalSummary.error,
    createdAt: enrollmentStudent.finalSummary.createdAt.toISOString(),
    updatedAt: enrollmentStudent.finalSummary.updatedAt.toISOString(),
  };
}

export const GET = withLoggedInUser<FinalSummaryResponse | null>(getHandler);
