import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DeleteResponse } from '@/types/api';
import { EnrollmentStudent } from '@prisma/client';

// DELETE /api/enrollments/[id]/students/[studentId] - Remove a student from an enrollment
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ id: string; studentId: string }> }): Promise<DeleteResponse> {
  const { id, studentId }: { id: string; studentId: string } = await params;

  // Verify the student belongs to the enrollment before deleting
  const student: EnrollmentStudent | null = await prisma.enrollmentStudent.findFirst({
    where: {
      id: studentId,
      enrollmentId: id,
    },
  });

  if (!student) {
    throw new Error('Student not found in this enrollment');
  }

  await prisma.enrollmentStudent.delete({
    where: { id: studentId },
  });

  return { message: 'Student removed from enrollment successfully' };
}

export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
