import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

interface ExerciseResponse {
  id: string;
  title: string;
  details: string;
  promptHint?: string | null;
  orderNumber: number;
  module: {
    orderNumber: number;
  };
}

// GET /api/student/exercises/[exerciseId] - Get exercise details for a student
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<ExerciseResponse> {
  const { exerciseId } = await params;
  const { userId } = userContext;

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get exercise details and verify student has access through enrollment
  const exercise = await prisma.moduleExercise.findFirst({
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
            },
          },
        },
      },
    },
  });

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  // Check if student is enrolled in the case study
  const isEnrolled = exercise.module.caseStudy.enrollments.some((enrollment) => enrollment.students.some((student) => student.assignedStudentId === userId));

  if (!isEnrolled) {
    throw new Error('Student is not enrolled in this case study');
  }

  return {
    id: exercise.id,
    title: exercise.title,
    details: exercise.details,
    promptHint: exercise.promptHint,
    orderNumber: exercise.orderNumber,
    module: {
      orderNumber: exercise.module.orderNumber,
    },
  };
}

export const GET = withLoggedInUser<ExerciseResponse>(getHandler);
