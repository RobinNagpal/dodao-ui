import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface NextExerciseResponse {
  nextExerciseId?: string;
  nextModuleId?: string;
  caseStudyId?: string;
  isComplete: boolean;
  message: string;
}

// GET /api/student/exercises/[exerciseId]/next-exercise - Get next exercise or module info
async function getHandler(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }): Promise<NextExerciseResponse> {
  const { exerciseId } = await params;
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Get current exercise with full context
  const currentExercise = await prisma.moduleExercise.findFirst({
    where: {
      id: exerciseId,
    },
    include: {
      module: {
        include: {
          caseStudy: {
            include: {
              enrollments: {
                include: {
                  students: true,
                },
              },
              modules: {
                include: {
                  exercises: {
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
          },
          exercises: {
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
      },
    },
  });

  if (!currentExercise) {
    throw new Error('Exercise not found');
  }

  // Check if student is enrolled
  const isEnrolled = currentExercise.module.caseStudy.enrollments.some((enrollment) =>
    enrollment.students.some((student) => student.assignedStudentId === studentEmail)
  );

  if (!isEnrolled) {
    throw new Error('Student is not enrolled in this case study');
  }

  const currentModule = currentExercise.module;
  const caseStudy = currentModule.caseStudy;

  // Find next exercise in current module
  const nextExerciseInModule = currentModule.exercises.find((exercise) => exercise.orderNumber > currentExercise.orderNumber);

  if (nextExerciseInModule) {
    return {
      nextExerciseId: nextExerciseInModule.id,
      caseStudyId: caseStudy.id,
      isComplete: false,
      message: 'Next exercise found in current module',
    };
  }

  // Find next module in case study
  const nextModule = caseStudy.modules.find((module) => module.orderNumber > currentModule.orderNumber);

  if (nextModule && nextModule.exercises.length > 0) {
    const firstExerciseInNextModule = nextModule.exercises[0];
    return {
      nextExerciseId: firstExerciseInNextModule.id,
      nextModuleId: nextModule.id,
      caseStudyId: caseStudy.id,
      isComplete: false,
      message: 'Next exercise found in next module',
    };
  }

  // No more exercises or modules - case study is complete
  return {
    caseStudyId: caseStudy.id,
    isComplete: true,
    message: 'Case study completed - ready for final submission',
  };
}

export const GET = withErrorHandlingV2<NextExerciseResponse>(getHandler);
