import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { AttemptDetail, ExerciseProgress, StudentTableData, ModuleTableData } from '@/types';

interface TableResponse {
  students: StudentTableData[];
  modules: ModuleTableData[];
}

// GET /api/instructor/case-studies/[id]/students-table?instructorEmail=xxx - Get students data for table view
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<TableResponse> {
  const { id: caseStudyId } = await params;
  const { searchParams } = new URL(req.url);
  const instructorEmail = searchParams.get('instructorEmail');

  if (!instructorEmail) {
    throw new Error('Instructor email is required');
  }

  // First verify instructor has access to this case study
  const caseStudy = await prisma.caseStudy.findFirst({
    where: {
      id: caseStudyId,
      archive: false,
      enrollments: {
        some: {
          assignedInstructorId: instructorEmail,
          archive: false,
        },
      },
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
      enrollments: {
        where: {
          assignedInstructorId: instructorEmail,
          archive: false,
        },
        include: {
          students: {
            where: { archive: false },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!caseStudy) {
    throw new Error('Case study not found or you do not have access to it');
  }

  // Get all exercise IDs for this case study
  const allExerciseIds = caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // Get all students from all enrollments
  const allStudents = caseStudy.enrollments.flatMap((enrollment) => enrollment.students);

  // For each student, get their exercise attempts
  const studentsTableData: StudentTableData[] = [];

  for (const student of allStudents) {
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
        status: attempt.status,
        createdAt: attempt.createdAt.toISOString(),
      });
      return acc;
    }, {} as Record<string, AttemptDetail[]>);

    // Build exercise progress data
    const exercises: ExerciseProgress[] = caseStudy.modules.flatMap((module) =>
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
      enrollmentId: student.enrollmentId,
      exercises,
      createdAt: student.createdAt.toISOString(),
    });
  }

  // Prepare modules data for table headers
  const modules = caseStudy.modules.map((module) => ({
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

export const GET = withErrorHandlingV2(getHandler);
