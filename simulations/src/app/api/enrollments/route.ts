import { prismaAdapter } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/prisma';
import { CreateEnrollmentRequest, EnrollmentWithRelations } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
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

// POST /api/enrollments - Create a new enrollment
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<EnrollmentWithRelations> {
  const body: CreateEnrollmentRequest = await req.json();

  // Find instructor by email (frontend passes email in assignedInstructorId field)
  const instructorEmail: string = body.assignedInstructorEmail;
  let instructor = await prisma.user.findFirst({
    where: {
      email: instructorEmail,
    },
  });

  // If instructor doesn't exist, create a new user
  if (!instructor) {
    instructor = await prismaAdapter.createUser({
      email: instructorEmail,
      spaceId: KoalaGainsSpaceId,
      username: instructorEmail,
      authProvider: 'custom-email',
      role: 'Instructor',
    });
    if (!instructor) throw new Error(`Failed to create instructor ${instructorEmail} in Koala Gains. Please contact the Koala Gains team.`);
  }

  // Create enrollment using the instructor's ID (not email)
  const enrollment: EnrollmentWithRelations = await prisma.classCaseStudyEnrollment.create({
    data: {
      caseStudyId: body.caseStudyId,
      assignedInstructorId: instructor.id, // Use the instructor's ID, not email
      createdById: userContext.userId,
      updatedById: userContext.userId,
      archive: false,
      className: body.className || 'first section', // Use provided className or default
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

  // Add instructor details to the response
  return {
    ...enrollment,
    assignedInstructor: {
      id: instructor.id,
      email: instructor.email,
      username: instructor.username,
    },
  };
}

export const GET = withLoggedInUser<EnrollmentWithRelations[]>(getHandler);
export const POST = withLoggedInUser<EnrollmentWithRelations>(postHandler);
