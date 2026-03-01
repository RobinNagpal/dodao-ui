import { prismaAdapter } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/prisma';
import { CreateEnrollmentRequestForCaseStudy, EnrollmentWithStudents } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { NextRequest } from 'next/server';
import { requireAdminUser } from '@/utils/user-utils';

// GET /api/case-studies/[caseStudyId]/class-enrollments - Get enrollments for a case study for admin only
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<EnrollmentWithStudents[]> {
  const { caseStudyId } = await params;

  await requireAdminUser(userContext.userId, 'Only admins can fetch all class enrollments');

  const enrollments = await prisma.classCaseStudyEnrollment.findMany({
    where: { caseStudyId, archive: false },
    include: {
      students: {
        where: { archive: false },
        orderBy: { createdAt: 'asc' },
        include: { finalSubmission: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return enrollments as EnrollmentWithStudents[];
}

// POST /api/case-studies/[caseStudyId]/class-enrollments - Create a new enrollment for a specific case study
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<string> {
  await requireAdminUser(userContext.userId, 'Only admins can create class enrollments');

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
  await prisma.classCaseStudyEnrollment.create({
    data: {
      caseStudyId: caseStudyId, // Use the caseStudyId from URL parameter
      assignedInstructorId: instructor.id, // Use the instructor's ID, not email
      createdById: userContext.userId,
      updatedById: userContext.userId,
      archive: false,
      className: body.className || 'first section', // Use provided className or default
    },
  });

  return 'Enrollment created successfully';
}

export const GET = withLoggedInUser<EnrollmentWithStudents[]>(getHandler);
export const POST = withLoggedInUser<string>(postHandler);
