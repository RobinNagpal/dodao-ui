import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CaseStudyWithRelations } from '@/types/api';

// GET /api/student/case-studies/[id] - Get case study details for a student
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<CaseStudyWithRelations> {
  const { id } = await params;
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Check if student is enrolled in this case study
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      caseStudyId: id,
      archive: false,
      students: {
        some: {
          assignedStudentId: studentEmail,
          archive: false,
        },
      },
    },
    include: {
      caseStudy: {
        include: {
          modules: {
            where: {
              archive: false,
            },
            include: {
              exercises: {
                where: {
                  archive: false,
                },
                include: {
                  attempts: {
                    where: {
                      createdBy: studentEmail,
                      archive: false,
                    },
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                },
                orderBy: {
                  orderNumber: 'asc',
                },
              },
            },
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error('Student is not enrolled in this case study or case study does not exist');
  }

  return enrollment.caseStudy;
}

export const GET = withErrorHandlingV2<CaseStudyWithRelations>(getHandler);
