import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

interface ExerciseProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isAttempted: boolean;
  isCurrent: boolean;
  attemptCount: number;
}

interface ModuleProgress {
  id: string;
  title: string;
  orderNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  exercises: ExerciseProgress[];
}

interface ProgressResponse {
  caseStudyTitle: string;
  caseStudyId: string;
  currentModuleId: string;
  currentExerciseId: string;
  modules: ModuleProgress[];
}

// GET /api/student/exercises/[exerciseId]/progress - Get progress data for vertical stepper
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<ProgressResponse> {
  const { exerciseId } = await params;
  const { userId } = userContext;

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get current exercise with full case study context
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
                    include: {
                      attempts: {
                        where: {
                          createdBy: userId,
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

  const caseStudy = currentExercise.module.caseStudy;
  const currentModuleId = currentExercise.module.id;

  // Helper function to check if exercise is completed
  const isExerciseCompleted = (exercise: any) => {
    return exercise.attempts && exercise.attempts.some((attempt: any) => attempt.status === 'completed');
  };

  // Helper function to check if exercise is attempted
  const isExerciseAttempted = (exercise: any) => {
    return exercise.attempts && exercise.attempts.length > 0;
  };

  // Build module progress data
  const modules: ModuleProgress[] = caseStudy.modules.map((module) => {
    const exercises: ExerciseProgress[] = module.exercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      orderNumber: exercise.orderNumber,
      isCompleted: isExerciseCompleted(exercise),
      isAttempted: isExerciseAttempted(exercise),
      isCurrent: exercise.id === exerciseId,
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
    currentExerciseId: exerciseId,
    modules,
  };
}

export const GET = withLoggedInUser<ProgressResponse>(getHandler);
