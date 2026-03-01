import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { requireAdminOrInstructorUser } from '@/utils/user-utils';

interface FinalReportDataExercise {
  orderNumber: number;
  title: string;
  prompt: string | null;
  promptResponse: string | null;
}

interface FinalReportDataModule {
  orderNumber: number;
  title: string;
  exercises: FinalReportDataExercise[];
}

interface FinalReportResponse {
  caseStudyTitle: string;
  studentName: string | null;
  studentEmail: string | null;
  modules: FinalReportDataModule[];
}

// GET /api/instructor/students/[studentId]/final-report/[caseStudyId] - Get student's final report data
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ studentId: string; caseStudyId: string }> }
): Promise<FinalReportResponse> {
  const { studentId, caseStudyId } = await params;
  const { userId } = userContext;

  // Verify user has instructor role
  const user = await requireAdminOrInstructorUser(userId);

  // Get the student enrollment and verify access
  const student = await prisma.enrollmentStudent.findFirst({
    where: {
      id: studentId,
      archive: false,
      enrollment: {
        caseStudyId: caseStudyId,
        archive: false,
        ...(user.role === 'Instructor' ? { assignedInstructorId: userId } : {}),
      },
    },
    include: {
      assignedStudent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      enrollment: {
        include: {
          caseStudy: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found or you do not have access');
  }

  // Get case study with modules and exercises, along with student's selected attempts
  const caseStudy = await prisma.caseStudy.findFirstOrThrow({
    where: {
      id: caseStudyId,
      archive: false,
    },
    include: {
      modules: {
        where: {
          archive: false,
        },
        include: {
          exercises: {
            where: {
              archive: false,
            },
            include: {
              attempts: {
                where: {
                  createdById: student.assignedStudentId,
                  status: 'completed',
                  selectedForSummary: true,
                  archive: false,
                },
                orderBy: {
                  attemptNumber: 'asc',
                },
                take: 1,
              },
            },
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
        orderBy: {
          orderNumber: 'asc',
        },
      },
    },
  });

  // Build the report data - include all modules/exercises, selected attempts where available
  const modules: FinalReportDataModule[] = caseStudy.modules.map((module) => ({
    orderNumber: module.orderNumber,
    title: module.title,
    exercises: module.exercises.map((exercise) => ({
      orderNumber: exercise.orderNumber,
      title: exercise.title,
      prompt: exercise.attempts[0]?.prompt || null,
      promptResponse: exercise.attempts[0]?.promptResponse || null,
    })),
  }));

  return {
    caseStudyTitle: caseStudy.title,
    studentName: student.assignedStudent.name,
    studentEmail: student.assignedStudent.email,
    modules,
  };
}

export const GET = withLoggedInUser<FinalReportResponse>(getHandler);
