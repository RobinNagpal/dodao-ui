import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EnrollmentWithRelations, DeleteResponse } from '@/types/api';

// GET /api/enrollments/[id] - Get a specific enrollment
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<EnrollmentWithRelations> {
  const { id } = await params;

  const enrollment: EnrollmentWithRelations = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      id,
      archive: false,
    },
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
        where: {
          archive: false,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          assignedStudent: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  return enrollment;
}

// DELETE /api/enrollments/[id] - Delete an enrollment
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<DeleteResponse> {
  const { id } = await params;

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // First archive all related enrollment students
    await tx.enrollmentStudent.updateMany({
      where: {
        enrollmentId: id,
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Then archive the enrollment
    await tx.classCaseStudyEnrollment.update({
      where: { id },
      data: {
        archive: true,
      },
    });
  });

  return { message: 'Enrollment deleted successfully' };
}

export const GET = withErrorHandlingV2<EnrollmentWithRelations>(getHandler);
export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
