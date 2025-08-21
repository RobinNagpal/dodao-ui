import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { ExerciseAttempt } from '@prisma/client';

interface UpdateAttemptRequest {
  attemptId: string;
  updatedResponse: string;
  studentEmail: string;
}

interface UpdateAttemptResponse {
  attempt: ExerciseAttempt;
}

// PUT /api/student/exercises/[exerciseId]/attempts/update - Update exercise attempt response
async function putHandler(req: NextRequest): Promise<UpdateAttemptResponse> {
  const body: UpdateAttemptRequest = await req.json();
  const { attemptId, updatedResponse, studentEmail } = body;

  if (!attemptId || !updatedResponse || !studentEmail) {
    throw new Error('Attempt ID, updated response, and student email are required');
  }

  // Verify the attempt belongs to the student
  const existingAttempt = await prisma.exerciseAttempt.findFirst({
    where: {
      id: attemptId,
      createdBy: studentEmail,
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
      updatedBy: studentEmail,
      archive: false,
    },
  });

  return { attempt: updatedAttempt };
}

export const PUT = withErrorHandlingV2<UpdateAttemptResponse>(putHandler);
