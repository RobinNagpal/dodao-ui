import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

interface ContextResponse {
  caseStudy: {
    title: string;
    shortDescription: string;
    details: string;
  };
  module: {
    title: string;
    shortDescription: string;
    details: string;
  };
}

// GET /api/student/exercises/[exerciseId]/context - Get context for AI prompt
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<ContextResponse> {
  const { exerciseId } = await params;
  const { userId } = userContext;

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get exercise with case study and module context
  const exercise = await prisma.moduleExercise.findFirst({
    where: {
      id: exerciseId,
      archive: false,
    },
    include: {
      module: {
        include: {
          caseStudy: {},
        },
      },
    },
  });

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  return {
    caseStudy: {
      title: exercise.module.caseStudy.title,
      shortDescription: exercise.module.caseStudy.shortDescription,
      details: exercise.module.caseStudy.details,
    },
    module: {
      title: exercise.module.title,
      shortDescription: exercise.module.shortDescription,
      details: exercise.module.details,
    },
  };
}

export const GET = withLoggedInUser<ContextResponse>(getHandler);
