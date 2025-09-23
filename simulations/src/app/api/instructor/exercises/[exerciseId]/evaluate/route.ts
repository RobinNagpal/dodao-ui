import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { evaluateStudentPrompt } from '@/utils/llm-utils';

interface EvaluatePromptRequest {
  studentId: string;
  attemptId: string;
}

interface EvaluatePromptResponse {
  evaluatedScore: number;
  evaluationReasoning: string;
  finalScore: number;
}

// POST /api/instructor/exercises/[exerciseId]/evaluate - Evaluate student's prompt using AI
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<EvaluatePromptResponse> {
  const { exerciseId } = await params;
  const { userId } = userContext;
  const body: EvaluatePromptRequest = await req.json();
  const { studentId, attemptId } = body;

  if (!exerciseId || !studentId || !attemptId || !userId) {
    throw new Error('Exercise ID, student ID, attempt ID and user ID are required');
  }

  // Verify user has instructor/admin role
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (user.role !== 'Instructor' && user.role !== 'Admin') {
    throw new Error('Only instructors and admins can evaluate student prompts');
  }

  // Get exercise details with grading logic
  const exercise = await prisma.moduleExercise.findFirst({
    where: {
      id: exerciseId,
      archive: false,
    },
    include: {
      module: {
        include: {
          caseStudy: {
            include: {
              enrollments: {
                where: {
                  archive: false,
                  assignedInstructorId: user.role === 'Admin' ? undefined : userId,
                },
                include: {
                  students: {
                    where: {
                      archive: false,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  // Verify instructor has access to this case study (skip for admin)
  if (user.role !== 'Admin') {
    const hasAccess = exercise.module.caseStudy.enrollments.some((enrollment) => enrollment.assignedInstructorId === userId);

    if (!hasAccess) {
      throw new Error('You do not have access to this case study');
    }
  }

  // First, get the enrollment student to find the actual user ID
  const enrollmentStudent = await prisma.enrollmentStudent.findUnique({
    where: {
      id: studentId,
    },
    select: {
      assignedStudentId: true,
    },
  });

  if (!enrollmentStudent) {
    throw new Error('Enrollment student not found');
  }

  // Get the specific attempt to evaluate using the actual user ID
  const attempt = await prisma.exerciseAttempt.findFirst({
    where: {
      id: attemptId,
      exerciseId,
      createdById: enrollmentStudent.assignedStudentId,
      archive: false,
    },
  });

  if (!attempt) {
    throw new Error('Exercise attempt not found');
  }

  if (attempt.evaluatedScore !== null) {
    throw new Error('This attempt has already been evaluated');
  }

  if (!attempt.prompt) {
    throw new Error('No prompt found in this attempt to evaluate');
  }

  try {
    // Use the shared evaluation utility
    const evaluationResult = await evaluateStudentPrompt(
      attempt.prompt,
      exercise.title,
      exercise.details,
      exercise.instructorInstructions || 'No specific instructions provided',
      exercise.gradingLogic || undefined
    );

    const { evaluatedScore, evaluationReasoning } = evaluationResult;

    // Update the attempt with evaluation results
    await prisma.exerciseAttempt.update({
      where: { id: attemptId },
      data: {
        evaluatedScore: Math.round(evaluatedScore * 100) / 100, // Round to 2 decimal places
        evaluationReasoning,
        updatedById: userId,
      },
    });

    // Get the full enrollment student record for updating final score
    const fullEnrollmentStudent = await prisma.enrollmentStudent.findFirst({
      where: {
        id: studentId, // Use the enrollment student ID
        enrollment: {
          caseStudyId: exercise.module.caseStudyId,
          archive: false,
        },
        archive: false,
      },
    });

    if (!fullEnrollmentStudent) {
      throw new Error('Student enrollment not found');
    }

    // Get all evaluated attempts for this student in this case study
    const allEvaluatedAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        createdById: enrollmentStudent.assignedStudentId, // Use the actual user ID
        evaluatedScore: { not: null },
        archive: false,
        exercise: {
          module: {
            caseStudyId: exercise.module.caseStudyId,
          },
        },
      },
      select: {
        evaluatedScore: true,
      },
    });

    // Calculate average score
    const totalScore = allEvaluatedAttempts.reduce((sum, attempt) => sum + (attempt.evaluatedScore || 0), 0);
    const finalScore = allEvaluatedAttempts.length > 0 ? Math.round((totalScore / allEvaluatedAttempts.length) * 100) / 100 : 0;

    // Update final score
    await prisma.enrollmentStudent.update({
      where: { id: fullEnrollmentStudent.id },
      data: {
        finalScore: finalScore,
        updatedById: userId,
      },
    });

    return {
      evaluatedScore: Math.round(evaluatedScore * 100) / 100,
      evaluationReasoning,
      finalScore: finalScore,
    };
  } catch (error) {
    console.error('Error evaluating prompt:', error);
    throw new Error(`Failed to evaluate prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withLoggedInUser<EvaluatePromptResponse>(postHandler);
