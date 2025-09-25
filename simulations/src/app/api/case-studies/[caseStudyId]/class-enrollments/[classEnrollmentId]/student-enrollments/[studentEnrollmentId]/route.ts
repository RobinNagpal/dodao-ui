import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { verifyEnrollmentAccess } from '@/app/api/helpers/enrollments-util';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';

interface ExerciseAttemptDetail {
  id: string;
  attemptNumber: number;
  model: string | null;
  prompt: string | null;
  promptResponse: string | null;
  status: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExerciseDetail {
  id: string;
  title: string;
  details: string;
  orderNumber: number;
  attempts: ExerciseAttemptDetail[];
}

interface ModuleDetail {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises: ExerciseDetail[];
}

interface StudentDetailResponse {
  student: {
    id: string;
    assignedStudentId: string;
    enrollmentId: string;
    createdAt: string;
  };
  caseStudy: {
    id: string;
    title: string;
    shortDescription: string;
  };
  modules: ModuleDetail[];
  statistics: {
    totalExercises: number;
    attemptedExercises: number;
    totalAttempts: number;
    completionPercentage: number;
  };
}

// GET /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId]/student-enrollments/[studentEnrollmentId] - Get detailed student data
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

  // Find the enrollment student by ID
  const enrollmentStudent = await prisma.enrollmentStudent.findFirstOrThrow({
    where: {
      id: studentEnrollmentId,
      enrollmentId: enrollment.id,
      archive: false,
    },
  });

  // Get case study with modules and exercises
  const caseStudy = await prisma.caseStudy.findFirstOrThrow({
    where: {
      id: caseStudyId,
      archive: false,
    },
    include: {
      modules: {
        where: { archive: false },
        orderBy: { orderNumber: 'asc' },
        include: {
          exercises: {
            where: { archive: false },
            orderBy: { orderNumber: 'asc' },
          },
        },
      },
    },
  });

  // Get all exercise IDs for this case study
  const allExerciseIds = caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // Get all exercise attempts for this student
  const exerciseAttempts = await prisma.exerciseAttempt.findMany({
    where: {
      exerciseId: { in: allExerciseIds },
      createdById: enrollmentStudent.assignedStudentId,
      archive: false,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group attempts by exercise ID
  const attemptsByExercise = exerciseAttempts.reduce((acc, attempt) => {
    if (!acc[attempt.exerciseId]) {
      acc[attempt.exerciseId] = [];
    }
    acc[attempt.exerciseId].push({
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      model: attempt.model,
      prompt: attempt.prompt,
      promptResponse: attempt.promptResponse,
      status: attempt.status,
      error: attempt.error,
      createdAt: attempt.createdAt.toISOString(),
      updatedAt: attempt.updatedAt.toISOString(),
    });
    return acc;
  }, {} as Record<string, ExerciseAttemptDetail[]>);

  // Build the modules with exercises and attempts
  const modules: ModuleDetail[] = caseStudy.modules.map((module) => ({
    id: module.id,
    title: module.title,
    shortDescription: module.shortDescription,
    details: module.details,
    orderNumber: module.orderNumber,
    exercises: module.exercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      details: exercise.details,
      orderNumber: exercise.orderNumber,
      attempts: attemptsByExercise[exercise.id] || [],
    })),
  }));

  // Calculate statistics
  const totalExercises = allExerciseIds.length;
  const attemptedExerciseIds = [...new Set(exerciseAttempts.map((attempt) => attempt.exerciseId))];
  const attemptedExercises = attemptedExerciseIds.length;
  const totalAttempts = exerciseAttempts.length;
  const completionPercentage = totalExercises > 0 ? Math.round((attemptedExercises / totalExercises) * 100) : 0;

  return {
    student: {
      id: enrollmentStudent.id,
      assignedStudentId: enrollmentStudent.assignedStudentId,
      enrollmentId: enrollmentStudent.enrollmentId,
      createdAt: enrollmentStudent.createdAt.toISOString(),
    },
    caseStudy: {
      id: caseStudy.id,
      title: caseStudy.title,
      shortDescription: caseStudy.shortDescription,
    },
    modules,
    statistics: {
      totalExercises,
      attemptedExercises,
      totalAttempts,
      completionPercentage,
    },
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
  const student = await prisma.user.findFirst({
    where: {
      id: enrollmentStudent.assignedStudentId,
    },
  });

  if (!student) {
    throw new Error(`Student with ID ${enrollmentStudent.assignedStudentId} not found`);
  }

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
