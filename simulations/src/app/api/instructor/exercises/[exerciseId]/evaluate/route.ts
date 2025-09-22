import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

interface EvaluatePromptRequest {
  studentId: string;
  attemptId: string;
}

interface EvaluatePromptResponse {
  evaluatedScore: number;
  evaluationLogic: string;
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
    // Configure Gemini AI
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

    // Build evaluation prompt
    const evaluationPrompt = `
You are an expert evaluator for business case study exercises. Your task is to evaluate a student's prompt based on the exercise requirements and grading criteria.

**Exercise Details:**
Title: ${exercise.title}
Description: ${exercise.details}
Instructions: ${exercise.instructorInstructions || 'No specific instructions provided'}

**Grading Logic:**
${
  exercise.gradingLogic ||
  'Evaluate based on clarity, relevance, depth of analysis, and practical application. Consider how well the prompt addresses the exercise objectives.'
}

**Student's Prompt to Evaluate:**
${attempt.prompt}

**Evaluation Requirements:**
1. Score the prompt from 0 to 10 (10 being excellent, 0 being poor)
2. Provide detailed evaluation logic explaining your scoring

**Response Format (JSON only):**
{
  "evaluatedScore": [number from 0-10],
  "evaluationLogic": "[detailed explanation of the scoring reasoning, including strengths and areas for improvement]"
}

Only respond with the JSON object, no additional text.`;

    console.log('Evaluation Prompt:', evaluationPrompt);

    // Make AI request
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: evaluationPrompt,
    });

    const aiResponse = response.text?.trim() || '';
    console.log('AI Evaluation Response:', aiResponse);

    // Parse AI response
    let evaluationResult;
    try {
      // Remove any potential markdown formatting
      const cleanResponse = aiResponse.replace(/```json\n?|```\n?/g, '');
      evaluationResult = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('AI returned invalid response format');
    }

    const { evaluatedScore, evaluationLogic } = evaluationResult;

    // Validate the response
    if (typeof evaluatedScore !== 'number' || evaluatedScore < 0 || evaluatedScore > 10) {
      throw new Error('Invalid evaluated score from AI');
    }

    if (!evaluationLogic || typeof evaluationLogic !== 'string') {
      throw new Error('Invalid evaluation logic from AI');
    }

    // Update the attempt with evaluation results
    await prisma.exerciseAttempt.update({
      where: { id: attemptId },
      data: {
        evaluatedScore: Math.round(evaluatedScore * 100) / 100, // Round to 2 decimal places
        evaluationLogic,
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
      evaluationLogic,
      finalScore: finalScore,
    };
  } catch (error) {
    console.error('Error evaluating prompt:', error);
    throw new Error(`Failed to evaluate prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withLoggedInUser<EvaluatePromptResponse>(postHandler);
