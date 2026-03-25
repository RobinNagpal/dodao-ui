import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { requireAdminOrInstructorUser } from '@/utils/user-utils';

interface AllPromptsExercise {
  orderNumber: number;
  title: string;
  prompt: string | null;
  promptResponse: string | null;
}

interface AllPromptsModule {
  orderNumber: number;
  title: string;
  exercises: AllPromptsExercise[];
}

interface AllPromptsStudent {
  studentName: string | null;
  studentEmail: string | null;
  modules: AllPromptsModule[];
}

export interface AllPromptsResponse {
  caseStudyTitle: string;
  className: string;
  students: AllPromptsStudent[];
}

// GET /api/instructor/class-enrollments/[classEnrollmentId]/all-prompts/[caseStudyId]
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ classEnrollmentId: string; caseStudyId: string }> }
): Promise<AllPromptsResponse> {
  const { classEnrollmentId, caseStudyId } = await params;
  const { userId } = userContext;

  const user = await requireAdminOrInstructorUser(userId);

  // Verify enrollment access
  const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      id: classEnrollmentId,
      caseStudyId: caseStudyId,
      archive: false,
      ...(user.role === 'Instructor' ? { assignedInstructorId: userId } : {}),
    },
    include: {
      caseStudy: { select: { id: true, title: true } },
      students: {
        where: { archive: false },
        include: {
          assignedStudent: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // Get case study modules/exercises structure
  const caseStudy = await prisma.caseStudy.findFirstOrThrow({
    where: { id: caseStudyId, archive: false },
    include: {
      modules: {
        where: { archive: false },
        include: {
          exercises: {
            where: { archive: false },
            orderBy: { orderNumber: 'asc' },
          },
        },
        orderBy: { orderNumber: 'asc' },
      },
    },
  });

  // For each student, get their selected attempts for each exercise
  const students: AllPromptsStudent[] = await Promise.all(
    enrollment.students.map(async (student) => {
      const modules: AllPromptsModule[] = await Promise.all(
        caseStudy.modules.map(async (module) => {
          const exercises: AllPromptsExercise[] = await Promise.all(
            module.exercises.map(async (exercise) => {
              const selectedAttempt = await prisma.exerciseAttempt.findFirst({
                where: {
                  exerciseId: exercise.id,
                  createdById: student.assignedStudentId,
                  status: 'completed',
                  selectedForSummary: true,
                  archive: false,
                },
                orderBy: { attemptNumber: 'asc' },
              });

              return {
                orderNumber: exercise.orderNumber,
                title: exercise.title,
                prompt: selectedAttempt?.prompt || null,
                promptResponse: selectedAttempt?.promptResponse || null,
              };
            })
          );

          return {
            orderNumber: module.orderNumber,
            title: module.title,
            exercises,
          };
        })
      );

      return {
        studentName: student.assignedStudent.name,
        studentEmail: student.assignedStudent.email,
        modules,
      };
    })
  );

  return {
    caseStudyTitle: caseStudy.title,
    className: enrollment.className,
    students,
  };
}

export const GET = withLoggedInUser<AllPromptsResponse>(getHandler);
