import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CaseStudy } from '@/types';

// GET /api/instructor/case-studies?instructorEmail=xxx - Get case studies assigned to an instructor
async function getHandler(req: NextRequest): Promise<CaseStudy[]> {
  const { searchParams } = new URL(req.url);
  const instructorEmail = searchParams.get('instructorEmail');

  if (!instructorEmail) {
    throw new Error('Instructor email is required');
  }

  // Find case studies that have enrollments assigned to this instructor
  const caseStudies = await prisma.caseStudy.findMany({
    where: {
      archive: false,
      enrollments: {
        some: {
          assignedInstructorId: instructorEmail,
          archive: false,
        },
      },
    },
    include: {
      modules: {
        where: {
          archive: false,
        },
        orderBy: {
          orderNumber: 'asc',
        },
        include: {
          exercises: {
            where: {
              archive: false,
            },
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
      },
      enrollments: {
        where: {
          assignedInstructorId: instructorEmail,
          archive: false,
        },
        include: {
          students: {
            where: {
              archive: false,
            },
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              finalSubmission: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert Prisma types to our frontend types
  const formattedCaseStudies: CaseStudy[] = caseStudies.map((cs) => ({
    ...cs,
    createdBy: cs.createdBy || undefined,
    updatedBy: cs.updatedBy || undefined,
    modules: cs.modules?.map((module) => ({
      ...module,
      createdBy: module.createdBy || undefined,
      updatedBy: module.updatedBy || undefined,
      exercises: module.exercises?.map((exercise) => ({
        ...exercise,
        createdBy: exercise.createdBy || undefined,
        updatedBy: exercise.updatedBy || undefined,
      })),
    })),
    enrollments: cs.enrollments?.map((enrollment) => ({
      ...enrollment,
      createdBy: enrollment.createdBy || undefined,
      updatedBy: enrollment.updatedBy || undefined,
      students: enrollment.students?.map((student) => ({
        ...student,
        createdBy: student.createdBy || undefined,
        updatedBy: student.updatedBy || undefined,
        finalSubmission: student.finalSubmission
          ? {
              ...student.finalSubmission,
              createdBy: student.finalSubmission.createdBy || undefined,
              updatedBy: student.finalSubmission.updatedBy || undefined,
              finalContent: student.finalSubmission.finalContent || undefined,
            }
          : undefined,
      })),
    })),
  }));

  return formattedCaseStudies;
}

export const GET = withErrorHandlingV2(getHandler);
