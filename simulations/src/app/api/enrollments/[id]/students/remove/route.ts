import { prisma } from '@/prisma';
import { DeleteResponse } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

interface RemoveStudentRequest {
  studentEmail: string;
}

// DELETE /api/enrollments/[id]/students/remove - Remove a student from an enrollment by email
async function deleteHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ id: string }> }): Promise<DeleteResponse> {
  const { id: enrollmentId } = await params;
  const body: RemoveStudentRequest = await req.json();

  // Use a transaction to ensure all related data is archived together
  const result = await prisma.$transaction(async (tx) => {
    // Find the student first to get their ID
    const enrollmentStudent = await tx.enrollmentStudent.findFirst({
      where: {
        enrollmentId,
        archive: false,
      },
    });

    if (!enrollmentStudent) {
      throw new Error('Student not found in this enrollment');
    }

    // Archive the student from enrollment
    await tx.enrollmentStudent.updateMany({
      where: {
        enrollmentId,
        archive: false,
      },
      data: {
        archive: true,
        updatedById: userContext.userId,
        updatedAt: new Date(),
      },
    });

    // Archive the student's final submission (if exists)
    await tx.finalSubmission.updateMany({
      where: {
        studentId: enrollmentStudent.id,
        archive: false,
      },
      data: {
        archive: true,
        updatedById: userContext.userId,
        updatedAt: new Date(),
      },
    });

    // Archive all exercise attempts created by this student
    await tx.exerciseAttempt.updateMany({
      where: {
        createdById: userContext.userId,
        archive: false,
      },
      data: {
        archive: true,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  });

  return { message: 'Student and all related data removed from enrollment successfully' };
}

export const DELETE = withLoggedInUser<DeleteResponse>(deleteHandler);
