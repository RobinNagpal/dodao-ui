import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { prismaAdapter } from '@/app/api/auth/[...nextauth]/authOptions';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { AddStudentEnrollmentRequest } from '@/components/instructor/InstructorManageStudentsModal';

// GET /api/instructor/enrollments/[caseStudyId]/students - Get students enrolled in a case study for an instructor
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<string[]> {
  const { caseStudyId } = await params;
  const instructorId: string = userContext.userId;

  // Find the enrollment for this case study assigned to this instructor
  try {
    const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
      where: {
        caseStudyId,
        assignedInstructorId: instructorId,
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
        },
      },
    });

    // Get the student IDs
    const studentIds = enrollment.students.map((student): string => student.assignedStudentId);

    if (studentIds.length === 0) {
      return [];
    }

    // Fetch the user emails using the student IDs
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      select: {
        email: true,
      },
    });

    // Return the emails
    return users.map((user): string => user.email || '').filter((email) => email !== '');
  } catch (error) {
    // If no enrollment is found, return an empty array
    return [];
  }
}

// POST /api/instructor/enrollments/[caseStudyId]/students - Add a student to enrollment
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<{ message: string }> {
  const { caseStudyId } = await params;
  const body = (await req.json()) as AddStudentEnrollmentRequest;
  const { studentEmail } = body;
  const instructorId: string = userContext.userId;

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Find the enrollment for this case study assigned to this instructor
  const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      caseStudyId,
      assignedInstructorId: instructorId,
      archive: false,
    },
  });

  // Check if the student user exists, create if not
  let student = await prisma.user.findFirst({
    where: {
      email: studentEmail,
    },
  });

  if (!student) {
    student = await prismaAdapter.createUser({
      email: studentEmail,
      spaceId: KoalaGainsSpaceId,
      username: studentEmail,
      authProvider: 'custom-email',
      role: 'Student',
    });
    if (!student) throw new Error(`Failed to create student ${studentEmail} in Koala Gains. Please contact the Koala Gains team.`);
  }

  // Check if student is already enrolled
  try {
    await prisma.enrollmentStudent.findFirstOrThrow({
      where: {
        enrollmentId: enrollment.id,
        assignedStudentId: student.id,
        archive: false,
      },
    });

    throw new Error('Student is already enrolled in this case study');
  } catch (error) {
    // If the student is not found, we can proceed with enrollment
    if ((error as Error).message.includes('No')) {
      // Add the student
      await prisma.enrollmentStudent.create({
        data: {
          enrollmentId: enrollment.id,
          assignedStudentId: student.id,
          createdBy: instructorId,
          updatedBy: instructorId,
        },
      });

      return { message: 'Student added successfully' };
    }

    // Re-throw any other errors
    throw error;
  }
}

// DELETE /api/instructor/enrollments/[caseStudyId]/students - Remove a student from enrollment
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<{ message: string }> {
  const { caseStudyId } = await params;
  const body = (await req.json()) as AddStudentEnrollmentRequest;
  const { studentEmail } = body;
  const instructorId: string = userContext.userId;

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Find the user by email
  const student = await prisma.user.findFirst({
    where: {
      email: studentEmail,
    },
  });

  if (!student) {
    throw new Error(`Student with email ${studentEmail} not found`);
  }

  // Find the enrollment for this case study assigned to this instructor
  const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      caseStudyId,
      assignedInstructorId: instructorId,
      archive: false,
    },
  });

  // Use a transaction to ensure all related data is archived together
  const result = await prisma.$transaction(async (tx) => {
    // Find the student first to get their ID
    const enrollmentStudent = await tx.enrollmentStudent.findFirstOrThrow({
      where: {
        enrollmentId: enrollment.id,
        assignedStudentId: student.id,
        archive: false,
      },
    });

    // Archive the student from enrollment
    await tx.enrollmentStudent.updateMany({
      where: {
        enrollmentId: enrollment.id,
        assignedStudentId: student.id,
        archive: false,
      },
      data: {
        archive: true,
        updatedBy: instructorId,
        updatedAt: new Date(),
      },
    });

    // Archive the student's final submission (if exists)
    await tx.finalSubmission.updateMany({
      where: {
        studentId: enrollmentStudent.id,
        archive: false,
      },
      data: {
        archive: true,
        updatedBy: instructorId,
        updatedAt: new Date(),
      },
    });

    // Archive all exercise attempts created by this student
    await tx.exerciseAttempt.updateMany({
      where: {
        createdBy: studentEmail, // Keep using email here as it's likely stored this way in exercise attempts
        archive: false,
      },
      data: {
        archive: true,
        updatedBy: instructorId,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  });

  return { message: 'Student and all related data removed successfully' };
}

export const GET = withLoggedInUser<string[]>(getHandler);
export const POST = withLoggedInUser<{ message: string }>(postHandler);
export const DELETE = withLoggedInUser<{ message: string }>(deleteHandler);
