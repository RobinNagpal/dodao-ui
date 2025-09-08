import { prisma } from '@/prisma';
import { EnrollmentWithRelations } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { NextRequest } from 'next/server';

interface CreateEnrollmentRequest {
  caseStudyId: string;
  assignedInstructorId: string;
}

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

  return enrollments;
}

// POST /api/enrollments - Create a new enrollment
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<EnrollmentWithRelations> {
  const body: CreateEnrollmentRequest = await req.json();

  // Get admin email from request headers
  const adminEmail: string = req.headers.get('admin-email') || 'admin@example.com';

  let instructor = await prisma.user.findFirst({
    where: {
      email: body.assignedInstructorId,
    },
  });

  if (!instructor) {
    instructor = await prisma.user.create({
      data: {
        email: body.assignedInstructorId,
        spaceId: KoalaGainsSpaceId,
        username: body.assignedInstructorId,
        authProvider: 'Email',
        role: 'Instructor',
      },
    });
  }

  const enrollment: EnrollmentWithRelations = await prisma.classCaseStudyEnrollment.create({
    data: {
      caseStudyId: body.caseStudyId,
      assignedInstructorId: instructor.email!,
      createdBy: adminEmail,
      updatedBy: adminEmail,
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
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return enrollment;
}

export const GET = withLoggedInUser<EnrollmentWithRelations[]>(getHandler);
export const POST = withLoggedInUser<EnrollmentWithRelations>(postHandler);
