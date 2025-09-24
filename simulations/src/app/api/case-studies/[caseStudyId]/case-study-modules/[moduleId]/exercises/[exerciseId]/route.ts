import { checkCanAccessCaseStudy, checkCanEditCaseStudy } from '@/app/api/helpers/case-studies-util';
import type { NextRequest } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { prisma } from '@/prisma';
import type { ModuleExercise, ExerciseAttempt, CaseStudyModule, CaseStudy } from '@prisma/client';
import { StudentExerciseProgress, StudentModuleProgress, StudentProgressData, StudentNavigationData, ConsolidatedStudentExerciseResponse } from '@/types/api';

type ExerciseEntity = ModuleExercise;

// Types for complex nested data structures from Prisma queries
interface ExerciseWithAttempts extends ModuleExercise {
  attempts: ExerciseAttempt[];
}

interface ModuleWithExercises extends CaseStudyModule {
  exercises: ExerciseWithAttempts[];
}

interface CaseStudyWithModules extends CaseStudy {
  modules: ModuleWithExercises[];
  enrollments: {
    id: string;
    students: {
      assignedStudentId: string;
    }[];
  }[];
}

interface ModuleWithCaseStudy extends CaseStudyModule {
  caseStudy: CaseStudyWithModules;
  exercises: ExerciseWithAttempts[];
}

interface ExerciseWithFullContext extends ModuleExercise {
  module: ModuleWithCaseStudy;
  attempts: ExerciseAttempt[];
}

export interface UpdateModuleExerciseRequest {
  title: string;
  details: string;
  promptHint?: string | null;
  gradingLogic?: string | null;
  instructorInstructions?: string | null;
  orderNumber: number;
  archive: boolean;
}

// Helper function to get consolidated student exercise data
async function getConsolidatedStudentExerciseData(
  caseStudyId: string,
  moduleId: string,
  exerciseId: string,
  userId: string
): Promise<ConsolidatedStudentExerciseResponse> {
  // Get exercise with full context including all modules and exercises for navigation/progress calculations
  const exerciseWithFullContext = await prisma.moduleExercise.findFirst({
    where: {
      id: exerciseId,
      archive: false,
    },
    include: {
      // Include attempts for the current exercise at the root level
      attempts: {
        where: {
          createdById: userId,
          archive: false,
        },
        orderBy: {
          attemptNumber: 'asc',
        },
      },
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
                    include: {
                      attempts: {
                        where: {
                          createdById: userId,
                          archive: false,
                        },
                        orderBy: {
                          attemptNumber: 'asc',
                        },
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
          },
          exercises: {
            where: {
              archive: false,
            },
            include: {
              attempts: {
                where: {
                  createdById: userId,
                  archive: false,
                },
                orderBy: {
                  attemptNumber: 'asc',
                },
              },
            },
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
      },
    },
  });

  if (!exerciseWithFullContext) {
    throw new Error('Exercise not found');
  }

  // Extract attempts first, then work with the rest of the data
  const attempts = (exerciseWithFullContext as ExerciseWithFullContext).attempts || [];

  // Cast to our interface for the rest of the logic (excluding attempts)
  const typedExerciseWithFullContext = exerciseWithFullContext as ExerciseWithFullContext;

  // Check if student is enrolled
  const isEnrolled = typedExerciseWithFullContext.module.caseStudy.enrollments.some((enrollment) =>
    enrollment.students.some((student) => student.assignedStudentId === userId)
  );

  if (!isEnrolled) {
    throw new Error('Student is not enrolled in this case study');
  }

  const currentModule = typedExerciseWithFullContext.module;
  const caseStudy = currentModule.caseStudy;

  // Calculate navigation data (next/previous exercise logic)
  const navigationData = calculateNavigationData(typedExerciseWithFullContext, caseStudy as CaseStudyWithModules, currentModule as ModuleWithCaseStudy);

  // Calculate progress data
  const progressData = calculateProgressData(typedExerciseWithFullContext, caseStudy as CaseStudyWithModules, userId);

  return {
    id: typedExerciseWithFullContext.id,
    title: typedExerciseWithFullContext.title,
    details: typedExerciseWithFullContext.details,
    promptHint: typedExerciseWithFullContext.promptHint,
    orderNumber: typedExerciseWithFullContext.orderNumber,
    module: {
      id: currentModule.id,
      title: currentModule.title,
      shortDescription: currentModule.shortDescription,
      details: currentModule.details,
      orderNumber: currentModule.orderNumber,
      caseStudy: {
        id: caseStudy.id,
        title: caseStudy.title,
        shortDescription: caseStudy.shortDescription,
        details: caseStudy.details,
        subject: caseStudy.subject,
        finalSummaryPromptInstructions: caseStudy.finalSummaryPromptInstructions,
      },
    },
    navigation: navigationData,
    progress: progressData,
    attempts,
  };
}

// Helper function to calculate navigation data (next/previous exercise)
function calculateNavigationData(
  currentExercise: ExerciseWithFullContext,
  caseStudy: CaseStudyWithModules,
  currentModule: ModuleWithCaseStudy
): StudentNavigationData {
  // Find previous exercise - check current module first, then previous modules
  let previousExerciseId: string | undefined;
  let previousModuleId: string | undefined;
  let isFirstExercise = false;

  // Check for previous exercise in current module
  const previousExerciseInModule = currentModule.exercises
    .filter((exercise: ExerciseWithAttempts) => exercise.orderNumber < currentExercise.orderNumber)
    .sort((a: ExerciseWithAttempts, b: ExerciseWithAttempts) => b.orderNumber - a.orderNumber)[0];

  if (previousExerciseInModule) {
    previousExerciseId = previousExerciseInModule.id;
    previousModuleId = currentModule.id;
  } else {
    // Check previous modules for their last exercise
    const previousModules = caseStudy.modules
      .filter((module: ModuleWithExercises) => module.orderNumber < currentModule.orderNumber)
      .sort((a: ModuleWithExercises, b: ModuleWithExercises) => b.orderNumber - a.orderNumber);

    if (previousModules.length > 0) {
      const lastPreviousModule = previousModules[0];
      if (lastPreviousModule.exercises.length > 0) {
        const lastExerciseInPreviousModule = lastPreviousModule.exercises.sort(
          (a: ExerciseWithAttempts, b: ExerciseWithAttempts) => b.orderNumber - a.orderNumber
        )[0];
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
  const nextExerciseInModule = currentModule.exercises.find((exercise: ExerciseWithAttempts) => exercise.orderNumber > currentExercise.orderNumber);

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
  const nextModule = caseStudy.modules.find((module: ModuleWithExercises) => module.orderNumber > currentModule.orderNumber);

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

// Helper function to calculate progress data
function calculateProgressData(currentExercise: ExerciseWithFullContext, caseStudy: CaseStudyWithModules, userId: string): StudentProgressData {
  const currentModuleId = currentExercise.module.id;

  // Helper functions
  const isExerciseCompleted = (exercise: ExerciseWithAttempts) => {
    return exercise.attempts && exercise.attempts.some((attempt: ExerciseAttempt) => attempt.status === 'completed');
  };

  const isExerciseAttempted = (exercise: ExerciseWithAttempts) => {
    return exercise.attempts && exercise.attempts.length > 0;
  };

  // Build module progress data
  const modules: StudentModuleProgress[] = caseStudy.modules.map((module: ModuleWithExercises) => {
    const exercises: StudentExerciseProgress[] = module.exercises.map((exercise: ExerciseWithAttempts) => ({
      id: exercise.id,
      title: exercise.title,
      orderNumber: exercise.orderNumber,
      isCompleted: isExerciseCompleted(exercise),
      isAttempted: isExerciseAttempted(exercise),
      isCurrent: exercise.id === currentExercise.id,
      attemptCount: exercise.attempts ? exercise.attempts.length : 0,
    }));

    const isModuleCompleted = exercises.every((ex) => ex.isCompleted);
    const isCurrentModule = module.id === currentModuleId;

    return {
      id: module.id,
      title: module.title,
      orderNumber: module.orderNumber,
      isCompleted: isModuleCompleted,
      isCurrent: isCurrentModule,
      exercises,
    };
  });

  return {
    caseStudyTitle: caseStudy.title,
    caseStudyId: caseStudy.id,
    currentModuleId,
    currentExerciseId: currentExercise.id,
    modules,
  };
}

// GET /api/case-studies/[caseStudyId]/case-study-modules/[moduleId]/exercises/[exerciseId]
async function getByIdHandler(
  _req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string; exerciseId: string }> }
): Promise<ModuleExercise | ConsolidatedStudentExerciseResponse> {
  const { caseStudyId, moduleId, exerciseId } = await dynamic.params;
  const { userId } = userContext;

  // Check user role
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
  });

  // For students, return consolidated data
  if (user.role === 'Student') {
    return await getConsolidatedStudentExerciseData(caseStudyId, moduleId, exerciseId, userId);
  }

  await checkCanAccessCaseStudy(userContext, caseStudyId);

  // For admin/instructor, return basic exercise data
  const exercise: ExerciseEntity = await prisma.moduleExercise.findFirstOrThrow({
    where: { id: exerciseId },
  });

  return exercise;
}

// PATCH /api/module-exercises/[id]
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string; exerciseId: string }> }
): Promise<ModuleExercise> {
  const { caseStudyId, moduleId, exerciseId } = await dynamic.params;
  await checkCanEditCaseStudy(userContext, caseStudyId);

  const body: UpdateModuleExerciseRequest = await req.json();

  const updated: ExerciseEntity = await prisma.moduleExercise.update({
    where: { id: exerciseId },
    data: {
      title: body.title,
      details: body.details,
      promptHint: body.promptHint ?? undefined,
      gradingLogic: body.gradingLogic ?? undefined,
      instructorInstructions: body.instructorInstructions ?? undefined,
      orderNumber: body.orderNumber,
      archive: body.archive,
      updatedById: userContext.userId,
    },
  });

  return updated;
}

// DELETE /api/module-exercises/[id]
async function deleteHandler(
  _req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string; exerciseId: string }> }
): Promise<ModuleExercise> {
  const { caseStudyId, moduleId, exerciseId } = await dynamic.params;
  await checkCanEditCaseStudy(userContext, caseStudyId);

  const archived: ExerciseEntity = await prisma.moduleExercise.update({
    where: { id: exerciseId },
    data: {
      archive: true,
      updatedById: userContext.userId,
    },
  });

  return archived;
}

export const GET = withLoggedInUser<ModuleExercise | ConsolidatedStudentExerciseResponse>(getByIdHandler);
export const PUT = withLoggedInUser<ExerciseEntity>(putHandler);
export const DELETE = withLoggedInUser<ExerciseEntity>(deleteHandler);
