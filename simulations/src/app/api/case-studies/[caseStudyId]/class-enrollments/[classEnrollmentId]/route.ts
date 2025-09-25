import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EnrollmentWithRelations, DeleteResponse } from '@/types/api';

// GET /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId] - Get a specific enrollment
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<EnrollmentWithRelations> {
  const { classEnrollmentId } = await params;

  const enrollment: EnrollmentWithRelations = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      id: classEnrollmentId,
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

// DELETE /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId] - Delete an enrollment
async function deleteHandler(
  req: NextRequest,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<DeleteResponse> {
  const { classEnrollmentId } = await params;

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // First archive all related enrollment students
    await tx.enrollmentStudent.updateMany({
      where: {
        enrollmentId: classEnrollmentId,
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Then archive the enrollment
    await tx.classCaseStudyEnrollment.update({
      where: { id: classEnrollmentId },
      data: {
        archive: true,
      },
    });
  });

  return { message: 'Enrollment deleted successfully' };
}

export const GET = withErrorHandlingV2<EnrollmentWithRelations>(getHandler);
export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
