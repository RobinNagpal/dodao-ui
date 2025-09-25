import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { verifyEnrollmentAccess } from '@/app/api/helpers/enrollments-util';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { StudentDetailResponse } from '@/types/api';

// GET /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId]/student-enrollments/[studentEnrollmentId] - Get student-specific data only
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string; studentEnrollmentId: string }> }
): Promise<StudentDetailResponse> {
  const { caseStudyId, classEnrollmentId, studentEnrollmentId } = await params;

  // Verify user has access to this enrollment
  const enrollment = await verifyEnrollmentAccess({
    userContext,
    classEnrollmentId,
    caseStudyId,
  });

  // Get student data with enrollment and assigned student info
  const studentData = await prisma.enrollmentStudent.findFirstOrThrow({
    where: {
      id: studentEnrollmentId,
      enrollmentId: enrollment.id,
      archive: false,
    },
    include: {
      enrollment: true, // Include class enrollment details (has className)
      assignedStudent: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Get all exercise IDs for this case study (to filter attempts)
  const caseStudyExercises = await prisma.moduleExercise.findMany({
    where: {
      module: {
        caseStudyId: caseStudyId,
        archive: false,
      },
      archive: false,
    },
    select: {
      id: true,
    },
  });

  const exerciseIds = caseStudyExercises.map((e) => e.id);

  // Get all attempts for this student in this case study
  const attempts = await prisma.exerciseAttempt.findMany({
    where: {
      exerciseId: { in: exerciseIds },
      createdById: studentData.assignedStudentId,
      archive: false,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Return student data with attempts
  return {
    ...studentData,
    attempts,
  };
}

// DELETE /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId]/student-enrollments/[studentEnrollmentId] - Remove a student from specific class enrollment
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string; studentEnrollmentId: string }> }
): Promise<{ message: string }> {
  const { caseStudyId, classEnrollmentId, studentEnrollmentId } = await params;
  const userId: string = userContext.userId;

  // Verify user has access to this enrollment
  const enrollment = await verifyEnrollmentAccess({
    userContext,
    classEnrollmentId,
    caseStudyId,
  });

  // Find the enrollment student by ID
  const enrollmentStudent = await prisma.enrollmentStudent.findFirstOrThrow({
    where: {
      id: studentEnrollmentId,
      enrollmentId: enrollment.id,
      archive: false,
    },
  });

  // Find the user by assignedStudentId
  const student = await prisma.user.findFirstOrThrow({
    where: {
      id: enrollmentStudent.assignedStudentId,
    },
  });

  // Use a transaction to ensure all related data is archived together
  const result = await prisma.$transaction(async (tx) => {
    // Archive the student from enrollment
    await tx.enrollmentStudent.updateMany({
      where: {
        id: studentEnrollmentId,
        enrollmentId: enrollment.id,
        archive: false,
      },
      data: {
        archive: true,
        updatedById: userId,
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
        updatedById: userId,
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
        updatedById: userId,
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
        updatedById: userId,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  });

  return { message: 'Student and all related data removed successfully' };
}

export const GET = withLoggedInUser<StudentDetailResponse>(getHandler);
export const DELETE = withLoggedInUser<{ message: string }>(deleteHandler);
