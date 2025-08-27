import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { ExerciseAttempt } from '@prisma/client';

interface SelectAttemptRequest {
  attemptId: string;
  studentEmail: string;
}

interface SelectAttemptResponse {
  attempts: ExerciseAttempt[];
}

// PUT /api/student/exercises/[exerciseId]/attempts/select - Select an attempt for final summary
async function putHandler(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }): Promise<SelectAttemptResponse> {
  const { exerciseId } = await params;
  const body: SelectAttemptRequest = await req.json();
  const { attemptId, studentEmail } = body;

  if (!attemptId || !studentEmail) {
    throw new Error('Attempt ID and student email are required');
  }

  // Verify the attempt belongs to the student and exercise
  const existingAttempt = await prisma.exerciseAttempt.findFirst({
    where: {
      id: attemptId,
      exerciseId,
      createdBy: studentEmail,
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
        createdBy: studentEmail,
        archive: false,
      },
      data: {
        selectedForSummary: false,
        updatedBy: studentEmail,
      },
    });

    // Then, select the specific attempt
    await tx.exerciseAttempt.update({
      where: {
        id: attemptId,
      },
      data: {
        selectedForSummary: true,
        updatedBy: studentEmail,
      },
    });

    // Return all attempts for this exercise by this student
    const attempts = await tx.exerciseAttempt.findMany({
      where: {
        exerciseId,
        createdBy: studentEmail,
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

export const PUT = withErrorHandlingV2<SelectAttemptResponse>(putHandler);
export const POST = withErrorHandlingV2<SelectAttemptResponse>(putHandler);
