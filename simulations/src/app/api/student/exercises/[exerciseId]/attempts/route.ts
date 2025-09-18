import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { GoogleGenAI } from '@google/genai';
import { ExerciseAttempt } from '@prisma/client';
import { NextRequest } from 'next/server';

interface CreateAttemptRequest {
  prompt: string;
}

interface CreateAttemptResponse {
  attempt: ExerciseAttempt;
}

// POST /api/student/exercises/[exerciseId]/attempts - Create new exercise attempt with AI response
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<CreateAttemptResponse> {
  const { exerciseId } = await params;
  const { userId } = userContext;
  const body: CreateAttemptRequest = await req.json();
  const { prompt } = body;

  if (!prompt || !userId) {
    throw new Error('Prompt and user ID are required');
  }

  // Get exercise details and verify student has access
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
      attempts: {
        where: {
          createdById: userId,
          archive: false,
        },
        orderBy: {
          attemptNumber: 'desc',
        },
      },
    },
  });

  if (!exercise) {
    throw new Error('Exercise not found');
  }

  // Check if student is enrolled in the case study
  const isEnrolled = exercise.module.caseStudy.enrollments.some((enrollment) => enrollment.students.some((student) => student.assignedStudentId === userId));

  if (!isEnrolled) {
    throw new Error('Student is not enrolled in this case study');
  }

  // Check if student has exceeded 3 attempts
  if (exercise.attempts.length >= 3) {
    throw new Error('Maximum number of attempts (3) reached for this exercise');
  }

  const nextAttemptNumber = exercise.attempts.length + 1;

  try {
    // Configure Gemini AI
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

    const groundingTool = { googleSearch: {} };
    const config = { tools: [groundingTool] };

    // Build AI prompt
    const aiContext = `${prompt}`;

    console.log('Whole Prompt', aiContext);

    // Make AI request
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: aiContext,
      config,
    });

    const aiResponse = response.text;

    console.log('AI Response:', aiResponse);

    // Create the attempt record
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        exerciseId,
        createdById: userId,
        updatedById: userId,
        attemptNumber: nextAttemptNumber,
        model: 'gemini-2.5-pro',
        prompt,
        promptResponse: aiResponse,
        status: 'completed',
        archive: false,
        // Auto-select first successful attempt
        selectedForSummary: nextAttemptNumber === 1,
      },
    });

    return { attempt };
  } catch (error) {
    // Create failed attempt record
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        exerciseId,
        createdById: userId,
        updatedById: userId,
        attemptNumber: nextAttemptNumber,
        model: 'gemini-2.0-flash-exp',
        prompt,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        archive: false,
      },
    });

    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// GET /api/student/exercises/[exerciseId]/attempts - Get all attempts for an exercise by a student
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ exerciseId: string }> }
): Promise<ExerciseAttempt[]> {
  const { exerciseId } = await params;
  const { userId } = userContext;

  if (!userId) {
    throw new Error('User ID is required');
  }

  const attempts = await prisma.exerciseAttempt.findMany({
    where: {
      exerciseId,
      createdById: userId,
      archive: false,
    },
    orderBy: {
      attemptNumber: 'asc',
    },
  });

  return attempts;
}

export const POST = withLoggedInUser<CreateAttemptResponse>(postHandler);
export const GET = withLoggedInUser<ExerciseAttempt[]>(getHandler);
