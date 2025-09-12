import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ExerciseAttempt } from '@prisma/client';
import { NextRequest } from 'next/server';

interface UpdateAttemptRequest {
  attemptId: string;
  updatedResponse: string;
}

interface UpdateAttemptResponse {
  attempt: ExerciseAttempt;
}

// PUT /api/student/exercises/[exerciseId]/attempts/update - Update exercise attempt response
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<UpdateAttemptResponse> {
  const body: UpdateAttemptRequest = await req.json();
  const { attemptId, updatedResponse } = body;

  if (!attemptId || !updatedResponse) {
    throw new Error('Attempt ID and updated response are required');
  }

  // Verify the attempt belongs to the student
  const existingAttempt = await prisma.exerciseAttempt.findFirst({
    where: {
      id: attemptId,
      createdBy: userContext.userId,
      archive: false,
    },
  });

  if (!existingAttempt) {
    throw new Error('Attempt not found or access denied');
  }

  // Update the attempt
  const updatedAttempt = await prisma.exerciseAttempt.update({
    where: {
      id: attemptId,
    },
    data: {
      promptResponse: updatedResponse,
      updatedBy: userContext.userId,
      archive: false,
    },
  });

  return { attempt: updatedAttempt };
}

export const PUT = withLoggedInUser<UpdateAttemptResponse>(putHandler);
