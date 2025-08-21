import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface StudentProgress {
  id: string;
  assignedStudentId: string; // student email
  enrollmentId: string;
  totalExercises: number;
  attemptedExercises: number;
  currentModule?: {
    moduleNumber: number;
    moduleTitle: string;
    exerciseNumber: number;
    exerciseTitle: string;
  };
  completionPercentage: number;
  hasFinalSubmission: boolean;
  createdAt: string;
}

// GET /api/instructor/case-studies/[id]/students?instructorEmail=xxx - Get students with progress for a case study
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<StudentProgress[]> {
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
            include: {
              finalSubmission: true,
            },
          },
        },
      },
    },
  });

  if (!caseStudy) {
    throw new Error('Case study not found or you do not have access to it');
  }

  // Calculate total exercises across all modules
  const totalExercises = caseStudy.modules.reduce((total, module) => total + module.exercises.length, 0);

  // Get all exercise IDs for this case study
  const allExerciseIds = caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // Get all students from all enrollments
  const allStudents = caseStudy.enrollments.flatMap((enrollment) => enrollment.students);

  // For each student, calculate their progress
  const studentsProgress: StudentProgress[] = [];

  for (const student of allStudents) {
    // Get all exercise attempts for this student
    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        exerciseId: { in: allExerciseIds },
        createdBy: student.assignedStudentId,
        archive: false,
      },
      include: {
        exercise: {
          include: {
            module: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get unique attempted exercises
    const attemptedExerciseIds = [...new Set(exerciseAttempts.map((attempt) => attempt.exerciseId))];
    const attemptedExercises = attemptedExerciseIds.length;

    // Find current exercise (next unattempted exercise or last attempted)
    let currentModule: StudentProgress['currentModule'];

    for (const caseStudyModule of caseStudy.modules) {
      for (const exercise of caseStudyModule.exercises) {
        const hasAttempted = attemptedExerciseIds.includes(exercise.id);
        if (!hasAttempted) {
          // This is the next exercise to attempt
          currentModule = {
            moduleNumber: caseStudyModule.orderNumber,
            moduleTitle: caseStudyModule.title,
            exerciseNumber: exercise.orderNumber,
            exerciseTitle: exercise.title,
          };
          break;
        }
      }
      if (currentModule) break;
    }

    // If all exercises are attempted, show the last exercise
    if (!currentModule && exerciseAttempts.length > 0) {
      const lastAttempt = exerciseAttempts[0]; // Most recent attempt
      currentModule = {
        moduleNumber: lastAttempt.exercise.module.orderNumber,
        moduleTitle: lastAttempt.exercise.module.title,
        exerciseNumber: lastAttempt.exercise.orderNumber,
        exerciseTitle: lastAttempt.exercise.title,
      };
    }

    const completionPercentage = totalExercises > 0 ? Math.round((attemptedExercises / totalExercises) * 100) : 0;

    studentsProgress.push({
      id: student.id,
      assignedStudentId: student.assignedStudentId,
      enrollmentId: student.enrollmentId,
      totalExercises,
      attemptedExercises,
      currentModule,
      completionPercentage,
      hasFinalSubmission: !!student.finalSubmission,
      createdAt: student.createdAt.toISOString(),
    });
  }

  return studentsProgress.sort((a, b) => a.assignedStudentId.localeCompare(b.assignedStudentId));
}

export const GET = withErrorHandlingV2(getHandler);
