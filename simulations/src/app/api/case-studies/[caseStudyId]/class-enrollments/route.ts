import { prismaAdapter } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/prisma';
import { EnrollmentWithRelations, CreateEnrollmentRequestForCaseStudy } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { NextRequest } from 'next/server';

// POST /api/case-studies/[caseStudyId]/class-enrollments - Create a new enrollment for a specific case study
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<EnrollmentWithRelations> {
  const { caseStudyId } = await params;
  const body: CreateEnrollmentRequestForCaseStudy = await req.json();

  // Find instructor by email (frontend passes email in assignedInstructorEmail field)
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

  // Create enrollment using the caseStudyId from URL parameter and instructor's ID
  const enrollment: EnrollmentWithRelations = await prisma.classCaseStudyEnrollment.create({
    data: {
      caseStudyId: caseStudyId, // Use the caseStudyId from URL parameter
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

export const POST = withLoggedInUser<EnrollmentWithRelations>(postHandler);
