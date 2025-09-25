import { prisma } from '@/prisma';
import { EnrollmentWithRelations } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

// GET /api/enrollments - Get all enrollments
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<EnrollmentWithRelations[]> {
  const enrollments: EnrollmentWithRelations[] = await prisma.classCaseStudyEnrollment.findMany({
    where: {
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
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch instructor details for each enrollment
  const enrollmentsWithInstructors = await Promise.all(
    enrollments.map(async (enrollment) => {
      const instructor = await prisma.user.findUnique({
        where: {
          id: enrollment.assignedInstructorId,
        },
        select: {
          id: true,
          email: true,
          username: true,
        },
      });

      return {
        ...enrollment,
        assignedInstructor: instructor,
      };
    })
  );

  return enrollmentsWithInstructors;
}

export const GET = withLoggedInUser<EnrollmentWithRelations[]>(getHandler);
