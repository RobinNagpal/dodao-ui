import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface ContextResponse {
  caseStudyContext: string;
  previousAttempts: string[];
}

// GET /api/student/exercises/[exerciseId]/context - Get context for AI prompt
async function getHandler(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }): Promise<ContextResponse> {
  const { exerciseId } = await params;
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Get exercise with full context
  const exercise = await prisma.moduleExercise.findFirst({
    where: {
      id: exerciseId,
      archive: false,
    },
    include: {
      module: {
        include: {
          caseStudy: {},
          exercises: {
            where: {
              archive: false,
            },
            include: {
              attempts: {
                where: {
                  createdBy: studentEmail,
                  status: 'completed',
                  archive: false,
                },
                orderBy: {
                  attemptNumber: 'desc',
                },
                take: 1, // Get only the latest attempt per exercise
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

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  // Build case study context
  const caseStudyContext = `
Case Study: ${exercise.module.caseStudy.title}
Description: ${exercise.module.caseStudy.shortDescription}
Details: ${exercise.module.caseStudy.details}

Module: ${exercise.module.title}
Module Description: ${exercise.module.shortDescription}
Module Details: ${exercise.module.details}
`;

  // Get previous AI responses from exercises in the same module (before current exercise)
  const previousAttempts: string[] = [];

  for (const moduleExercise of exercise.module.exercises) {
    // Only include exercises that come before the current exercise
    if (moduleExercise.orderNumber < exercise.orderNumber) {
      const latestAttempt = moduleExercise.attempts[0]; // Already ordered by desc, so first is latest
      if (latestAttempt && latestAttempt.promptResponse) {
        previousAttempts.push(latestAttempt.promptResponse);
      }
    }
  }

  return {
    caseStudyContext,
    previousAttempts,
  };
}

export const GET = withErrorHandlingV2<ContextResponse>(getHandler);
