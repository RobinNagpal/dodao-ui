import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

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
  shortDescription: string;
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
  finalSubmission: {
    id: string;
    finalContent: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  statistics: {
    totalExercises: number;
    attemptedExercises: number;
    totalAttempts: number;
    completionPercentage: number;
  };
}

// GET /api/instructor/students/[studentId]/details?instructorEmail=xxx&caseStudyId=xxx - Get detailed student data
async function getHandler(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }): Promise<StudentDetailResponse> {
  const { studentId } = await params;
  const { searchParams } = new URL(req.url);
  const instructorEmail = searchParams.get('instructorEmail');
  const caseStudyId = searchParams.get('caseStudyId');

  if (!instructorEmail) {
    throw new Error('Instructor email is required');
  }

  if (!caseStudyId) {
    throw new Error('Case study ID is required');
  }

  // First verify instructor has access to this student through the case study
  const student = await prisma.enrollmentStudent.findFirst({
    where: {
      id: studentId,
      archive: false,
      enrollment: {
        caseStudyId: caseStudyId,
        assignedInstructorId: instructorEmail,
        archive: false,
      },
    },
    include: {
      enrollment: {
        include: {
          caseStudy: {
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
          },
        },
      },
      finalSubmission: true,
    },
  });

  if (!student) {
    throw new Error('Student not found or you do not have access to this student');
  }

  // Get all exercise IDs for this case study
  const allExerciseIds = student.enrollment.caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // Get all exercise attempts for this student
  const exerciseAttempts = await prisma.exerciseAttempt.findMany({
    where: {
      exerciseId: { in: allExerciseIds },
      createdBy: student.assignedStudentId,
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
  const modules: ModuleDetail[] = student.enrollment.caseStudy.modules.map((module) => ({
    id: module.id,
    title: module.title,
    shortDescription: module.shortDescription,
    details: module.details,
    orderNumber: module.orderNumber,
    exercises: module.exercises.map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      shortDescription: exercise.shortDescription,
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
      id: student.id,
      assignedStudentId: student.assignedStudentId,
      enrollmentId: student.enrollmentId,
      createdAt: student.createdAt.toISOString(),
    },
    caseStudy: {
      id: student.enrollment.caseStudy.id,
      title: student.enrollment.caseStudy.title,
      shortDescription: student.enrollment.caseStudy.shortDescription,
    },
    modules,
    finalSubmission: student.finalSubmission
      ? {
          id: student.finalSubmission.id,
          finalContent: student.finalSubmission.finalContent,
          createdAt: student.finalSubmission.createdAt.toISOString(),
          updatedAt: student.finalSubmission.updatedAt.toISOString(),
        }
      : null,
    statistics: {
      totalExercises,
      attemptedExercises,
      totalAttempts,
      completionPercentage,
    },
  };
}

export const GET = withErrorHandlingV2(getHandler);
