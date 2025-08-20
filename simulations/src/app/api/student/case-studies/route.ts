import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CaseStudyWithRelations } from '@/types/api';

// GET /api/student/case-studies - Get enrolled case studies for a student
async function getHandler(req: NextRequest): Promise<CaseStudyWithRelations[]> {
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Find all enrollments where this student is enrolled
  const enrollments = await prisma.classCaseStudyEnrollment.findMany({
    where: {
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

  // Extract case studies from enrollments and include instructor email
  const enrolledCaseStudies: CaseStudyWithRelations[] = enrollments.map((enrollment) => ({
    ...enrollment.caseStudy,
    instructorEmail: enrollment.assignedInstructorId,
  }));

  return enrolledCaseStudies;
}

export const GET = withErrorHandlingV2<CaseStudyWithRelations[]>(getHandler);
