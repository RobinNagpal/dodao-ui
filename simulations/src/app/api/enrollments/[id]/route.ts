import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EnrollmentWithRelations, DeleteResponse } from '@/types/api';

// GET /api/enrollments/[id] - Get a specific enrollment
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<EnrollmentWithRelations> {
  const { id }: { id: string } = await params;

  const enrollment: EnrollmentWithRelations = await prisma.classCaseStudyEnrollment.findUniqueOrThrow({
    where: { id },
    include: {
      caseStudy: {
        select: {
          id: true,
          title: true,
          shortDescription: true,
          subject: true,
        },
      },
      students: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return enrollment;
}

// DELETE /api/enrollments/[id] - Delete an enrollment
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<DeleteResponse> {
  const { id }: { id: string } = await params;

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // First delete all related enrollment students
    await tx.enrollmentStudent.deleteMany({
      where: { enrollmentId: id },
    });

    // Then delete the enrollment
    await tx.classCaseStudyEnrollment.delete({
      where: { id },
    });
  });

  return { message: 'Enrollment deleted successfully' };
}

export const GET = withErrorHandlingV2<EnrollmentWithRelations>(getHandler);
export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
