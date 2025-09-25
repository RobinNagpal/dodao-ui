import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { prismaAdapter } from '@/app/api/auth/[...nextauth]/authOptions';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { AddStudentEnrollmentRequest } from '@/components/instructor/InstructorManageStudentsModal';

// GET /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId] - Get students enrolled in a specific class enrollment
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<string[]> {
  const { caseStudyId, classEnrollmentId } = await params;
  const instructorId: string = userContext.userId;

  // Verify instructor has access to this enrollment
  const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      id: classEnrollmentId,
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
}

// POST /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId] - Add a student to specific class enrollment
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<{ message: string }> {
  const { caseStudyId, classEnrollmentId } = await params;
  const body = (await req.json()) as AddStudentEnrollmentRequest;
  const { studentEmail } = body;
  const instructorId: string = userContext.userId;

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Verify instructor has access to this enrollment
  const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      id: classEnrollmentId,
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

    throw new Error('Student is already enrolled in this class');
  } catch (error) {
    // If the student is not found, we can proceed with enrollment
    if ((error as Error).message.includes('No')) {
      // Add the student
      await prisma.enrollmentStudent.create({
        data: {
          enrollmentId: enrollment.id,
          assignedStudentId: student.id,
          createdById: instructorId,
          updatedById: instructorId,
        },
      });

      return { message: 'Student added successfully' };
    }

    // Re-throw any other errors
    throw error;
  }
}

// DELETE /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId] - Remove a student from specific class enrollment
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<{ message: string }> {
  const { caseStudyId, classEnrollmentId } = await params;
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

  // Verify instructor has access to this enrollment
  const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      id: classEnrollmentId,
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
        updatedById: instructorId,
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
        updatedById: instructorId,
        updatedAt: new Date(),
      },
    });

    // Archive the student's final summary (if exists)
    await tx.finalSummary.updateMany({
      where: {
        studentId: enrollmentStudent.id,
        archive: false,
      },
      data: {
        archive: true,
        updatedById: instructorId,
        updatedAt: new Date(),
      },
    });

    // Archive all exercise attempts created by this student
    await tx.exerciseAttempt.updateMany({
      where: {
        createdById: student.id,
        archive: false,
      },
      data: {
        archive: true,
        updatedById: instructorId,
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
