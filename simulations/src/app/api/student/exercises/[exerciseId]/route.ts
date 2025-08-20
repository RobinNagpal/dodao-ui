import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface ExerciseResponse {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  module: {
    orderNumber: number;
  };
}

// GET /api/student/exercises/[exerciseId] - Get exercise details for a student
async function getHandler(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }): Promise<ExerciseResponse> {
  const { exerciseId } = await params;
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Get exercise details and verify student has access through enrollment
  const exercise = await prisma.moduleExercise.findFirst({
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
  const isEnrolled = exercise.module.caseStudy.enrollments.some((enrollment) =>
    enrollment.students.some((student) => student.assignedStudentId === studentEmail)
  );

  if (!isEnrolled) {
    throw new Error('Student is not enrolled in this case study');
  }

  return {
    id: exercise.id,
    title: exercise.title,
    shortDescription: exercise.shortDescription,
    details: exercise.details,
    orderNumber: exercise.orderNumber,
    module: {
      orderNumber: exercise.module.orderNumber,
    },
  };
}

export const GET = withErrorHandlingV2<ExerciseResponse>(getHandler);
