import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CaseStudy } from '@/types';

// GET /api/instructor/case-studies/[id]?instructorEmail=xxx - Get a specific case study if instructor has access
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<CaseStudy> {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const instructorEmail = searchParams.get('instructorEmail');

  if (!instructorEmail) {
    throw new Error('Instructor email is required');
  }

  // Find the case study and verify instructor has access
  const caseStudy = await prisma.caseStudy.findFirst({
    where: {
      id,
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
              finalSubmission: {
                where: {
                  archive: false,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!caseStudy) {
    throw new Error('Case study not found or you do not have access to it');
  }

  // Convert Prisma types to our frontend types
  const formattedCaseStudy: CaseStudy = {
    ...caseStudy,
    createdBy: caseStudy.createdBy || undefined,
    updatedBy: caseStudy.updatedBy || undefined,
    modules: caseStudy.modules?.map((module) => ({
      ...module,
      createdBy: module.createdBy || undefined,
      updatedBy: module.updatedBy || undefined,
      exercises: module.exercises?.map((exercise) => ({
        ...exercise,
        createdBy: exercise.createdBy || undefined,
        updatedBy: exercise.updatedBy || undefined,
      })),
    })),
    enrollments: caseStudy.enrollments?.map((enrollment) => ({
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
  };

  return formattedCaseStudy;
}

export const GET = withErrorHandlingV2(getHandler);
