import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { AttemptDetail, ExerciseProgress, StudentTableData, ModuleTableData } from '@/types';

interface TableResponse {
  students: StudentTableData[];
  modules: ModuleTableData[];
}

// GET /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId]/students - Get students data for table view for specific enrollment
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<TableResponse> {
  const { caseStudyId, classEnrollmentId } = await params;

  // First verify instructor has access to this enrollment
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      id: classEnrollmentId,
      caseStudyId,
      assignedInstructorId: userContext.userId,
      archive: false,
    },
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
      students: {
        where: { archive: false },
        orderBy: { createdAt: 'asc' },
        include: {
          assignedStudent: {
            select: { email: true },
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error('Class enrollment not found or you do not have access to it');
  }

  // Get all exercise IDs for this case study
  const allExerciseIds = enrollment.caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // For each student in this enrollment, get their exercise attempts
  const studentsTableData: StudentTableData[] = [];

  for (const student of enrollment.students) {
    // Get all exercise attempts for this student
    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        exerciseId: { in: allExerciseIds },
        createdById: student.assignedStudentId,
        archive: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get final summary for this student
    const finalSummary = await prisma.finalSummary.findFirst({
      where: {
        studentId: student.id,
        archive: false,
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
        status: attempt.status,
        evaluatedScore: attempt.evaluatedScore,
        createdAt: attempt.createdAt.toISOString(),
      });
      return acc;
    }, {} as Record<string, AttemptDetail[]>);

    // Build exercise progress data
    const exercises: ExerciseProgress[] = enrollment.caseStudy.modules.flatMap((module) =>
      module.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        moduleId: module.id,
        moduleOrderNumber: module.orderNumber,
        exerciseOrderNumber: exercise.orderNumber,
        hasAttempts: !!attemptsByExercise[exercise.id]?.length,
        attempts: attemptsByExercise[exercise.id] || [],
      }))
    );

    studentsTableData.push({
      id: student.id,
      assignedStudentId: student.assignedStudentId,
      email: student.assignedStudent.email || 'Unknown',
      enrollmentId: student.enrollmentId,
      exercises,
      finalSummary: finalSummary
        ? {
            id: finalSummary.id,
            status: finalSummary.status,
            hasContent: !!finalSummary.response,
            response: finalSummary.response,
            createdAt: finalSummary.createdAt.toISOString(),
          }
        : undefined,
      createdAt: student.createdAt.toISOString(),
    });
  }

  // Prepare modules data for table headers
  const modules = enrollment.caseStudy.modules.map((module) => ({
    id: module.id,
    orderNumber: module.orderNumber,
    title: module.title,
    exercises: module.exercises.map((exercise) => ({
      id: exercise.id,
      orderNumber: exercise.orderNumber,
      title: exercise.title,
    })),
  }));

  return {
    students: studentsTableData.sort((a, b) => a.assignedStudentId.localeCompare(b.assignedStudentId)),
    modules,
  };
}

export const GET = withLoggedInUser<TableResponse>(getHandler);
