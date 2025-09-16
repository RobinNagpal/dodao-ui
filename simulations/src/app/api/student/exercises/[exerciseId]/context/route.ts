import { prisma } from '@/prisma';
import { ExerciseWithModuleAndCaseStudy } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<ExerciseWithModuleAndCaseStudy> {
  const { exerciseId } = await params;
  const { userId } = userContext;

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get exercise with case study and module context
  const exercise: ExerciseWithModuleAndCaseStudy = await prisma.moduleExercise.findFirstOrThrow({
    where: {
      id: exerciseId,
      archive: false,
    },
    include: {
      module: {
        include: {
          caseStudy: true,
        },
      },
    },
  });

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  return exercise;
}

export const GET = withLoggedInUser<ExerciseWithModuleAndCaseStudy>(getHandler);
