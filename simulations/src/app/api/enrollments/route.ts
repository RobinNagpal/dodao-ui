import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EnrollmentWithRelations } from '@/types/api';

interface CreateEnrollmentRequest {
  caseStudyId: string;
  assignedInstructorId: string;
}

// GET /api/enrollments - Get all enrollments
async function getHandler(): Promise<EnrollmentWithRelations[]> {
  const enrollments: EnrollmentWithRelations[] = await prisma.classCaseStudyEnrollment.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return enrollments;
}

// POST /api/enrollments - Create a new enrollment
async function postHandler(req: NextRequest): Promise<EnrollmentWithRelations> {
  const body: CreateEnrollmentRequest = await req.json();

  // Get admin email from request headers
  const adminEmail: string = req.headers.get('admin-email') || 'admin@example.com';

  const enrollment: EnrollmentWithRelations = await prisma.classCaseStudyEnrollment.create({
    data: {
      caseStudyId: body.caseStudyId,
      assignedInstructorId: body.assignedInstructorId,
      createdBy: adminEmail,
      updatedBy: adminEmail,
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
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return enrollment;
}

export const GET = withErrorHandlingV2<EnrollmentWithRelations[]>(getHandler);
export const POST = withErrorHandlingV2<EnrollmentWithRelations>(postHandler);
