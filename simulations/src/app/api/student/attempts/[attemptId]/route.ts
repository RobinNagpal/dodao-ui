import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { ExerciseAttempt } from '@prisma/client';

// GET /api/student/attempts/[attemptId] - Get attempt details
async function getHandler(req: NextRequest, { params }: { params: Promise<{ attemptId: string }> }): Promise<ExerciseAttempt> {
  const { attemptId } = await params;

  if (!attemptId) {
    throw new Error('Attempt ID is required');
  }

  const attempt = await prisma.exerciseAttempt.findFirst({
    where: {
      id: attemptId,
      archive: false,
    },
  });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  return attempt;
}

export const GET = withErrorHandlingV2(getHandler);
