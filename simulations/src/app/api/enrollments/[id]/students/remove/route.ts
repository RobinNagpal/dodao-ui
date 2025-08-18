import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { DeleteResponse } from '@/types/api';

interface RemoveStudentRequest {
  studentEmail: string;
}

// DELETE /api/enrollments/[id]/students/remove - Remove a student from an enrollment by email
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<DeleteResponse> {
  const { id: enrollmentId } = await params;
  const body: RemoveStudentRequest = await req.json();

  // Find and delete the student by email and enrollment
  const deletedStudent: Prisma.BatchPayload = await prisma.enrollmentStudent.deleteMany({
    where: {
      enrollmentId,
      assignedStudentId: body.studentEmail,
    },
  });

  if (deletedStudent.count === 0) {
    throw new Error('Student not found in this enrollment');
  }

  return { message: 'Student removed from enrollment successfully' };
}

export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
