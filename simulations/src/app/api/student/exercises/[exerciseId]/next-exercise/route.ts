import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

interface NextExerciseResponse {
  nextExerciseId?: string;
  nextModuleId?: string;
  caseStudyId?: string;
  isComplete: boolean;
  message: string;
  previousExerciseId?: string;
  previousModuleId?: string;
  isFirstExercise: boolean;
  isNextExerciseInDifferentModule: boolean;
}

// GET /api/student/exercises/[exerciseId]/next-exercise - Get next exercise or module info
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<NextExerciseResponse> {
  const { exerciseId } = await params;
  const { userId } = userContext;

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get current exercise with full context
  const currentExercise = await prisma.moduleExercise.findFirst({
    where: {
      id: exerciseId,
      archive: false,
    },
    include: {
      module: {
        include: {
          caseStudy: {
            include: {
              enrollments: {
                where: {
                  archive: false,
                },
                include: {
                  students: {
                    where: {
                      archive: false,
                    },
                  },
                },
              },
              modules: {
                where: {
                  archive: false,
                },
                include: {
                  exercises: {
                    where: {
                      archive: false,
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
          },
          exercises: {
            where: {
              archive: false,
            },
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
    enrollment.students.some((student) => student.assignedStudentId === userId)
  );

  if (!isEnrolled) {
    throw new Error('Student is not enrolled in this case study');
  }

  const currentModule = currentExercise.module;
  const caseStudy = currentModule.caseStudy;

  // Find previous exercise - check current module first, then previous modules
  let previousExerciseId: string | undefined;
  let previousModuleId: string | undefined;
  let isFirstExercise = false;

  // Check for previous exercise in current module
  const previousExerciseInModule = currentModule.exercises
    .filter((exercise) => exercise.orderNumber < currentExercise.orderNumber)
    .sort((a, b) => b.orderNumber - a.orderNumber)[0]; // Get the one with highest order number less than current

  if (previousExerciseInModule) {
    previousExerciseId = previousExerciseInModule.id;
    previousModuleId = currentModule.id;
  } else {
    // Check previous modules for their last exercise
    const previousModules = caseStudy.modules
      .filter((module) => module.orderNumber < currentModule.orderNumber)
      .sort((a, b) => b.orderNumber - a.orderNumber); // Sort desc to get the most recent previous module first

    if (previousModules.length > 0) {
      const lastPreviousModule = previousModules[0];
      if (lastPreviousModule.exercises.length > 0) {
        const lastExerciseInPreviousModule = lastPreviousModule.exercises
          .sort((a, b) => b.orderNumber - a.orderNumber)[0]; // Get last exercise in previous module
        previousExerciseId = lastExerciseInPreviousModule.id;
        previousModuleId = lastPreviousModule.id;
      }
    }
  }

  // If no previous exercise found, this is the first exercise of the case study
  if (!previousExerciseId) {
    isFirstExercise = true;
  }

  // Find next exercise in current module
  const nextExerciseInModule = currentModule.exercises.find((exercise) => exercise.orderNumber > currentExercise.orderNumber);

  if (nextExerciseInModule) {
    return {
      nextExerciseId: nextExerciseInModule.id,
      caseStudyId: caseStudy.id,
      isComplete: false,
      message: 'Next exercise found in current module',
      previousExerciseId,
      previousModuleId,
      isFirstExercise,
      isNextExerciseInDifferentModule: false,
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
      previousExerciseId,
      previousModuleId,
      isFirstExercise,
      isNextExerciseInDifferentModule: true,
    };
  }

  // No more exercises or modules - case study is complete
  return {
    caseStudyId: caseStudy.id,
    isComplete: true,
    message: 'Case study completed - ready for final submission',
    previousExerciseId,
    previousModuleId,
    isFirstExercise,
    isNextExerciseInDifferentModule: false,
  };
}

export const GET = withLoggedInUser<NextExerciseResponse>(getHandler);
