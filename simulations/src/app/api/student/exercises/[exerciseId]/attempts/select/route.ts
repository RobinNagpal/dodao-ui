import { prisma } from '@/prisma';
import { withLoggedInUserAndActivityLog } from '@/middleware/withActivityLogging';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ExerciseAttempt } from '@prisma/client';
import { NextRequest } from 'next/server';

interface SelectAttemptRequest {
  attemptId: string;
}

interface SelectAttemptResponse {
  attempts: ExerciseAttempt[];
}

// PUT /api/student/exercises/[exerciseId]/attempts/select - Select an attempt for final summary
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<SelectAttemptResponse> {
  const { exerciseId } = await params;
  const { userId } = userContext;
  const body: SelectAttemptRequest = await req.json();
  const { attemptId } = body;

  if (!attemptId || !userId) {
    throw new Error('Attempt ID and user ID are required');
  }

  // Verify the attempt belongs to the student and exercise
  const existingAttempt = await prisma.exerciseAttempt.findFirst({
    where: {
      id: attemptId,
      exerciseId,
      createdById: userId,
      archive: false,
    },
  });

  if (!existingAttempt) {
    throw new Error('Attempt not found or access denied');
  }

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // First, deselect all attempts for this exercise by this student
    await tx.exerciseAttempt.updateMany({
      where: {
        exerciseId,
        createdById: userId,
        archive: false,
      },
      data: {
        selectedForSummary: false,
        updatedById: userId,
      },
    });

    // Then, select the specific attempt
    await tx.exerciseAttempt.update({
      where: {
        id: attemptId,
      },
      data: {
        selectedForSummary: true,
        updatedById: userId,
      },
    });

    // Return all attempts for this exercise by this student
    const attempts = await tx.exerciseAttempt.findMany({
      where: {
        exerciseId,
        createdById: userId,
        archive: false,
      },
      orderBy: {
        attemptNumber: 'asc',
      },
    });

    return attempts;
  });

  return { attempts: result };
}

export const PUT = withLoggedInUserAndActivityLog<SelectAttemptResponse>(putHandler);
export const POST = withLoggedInUserAndActivityLog<SelectAttemptResponse>(putHandler);
