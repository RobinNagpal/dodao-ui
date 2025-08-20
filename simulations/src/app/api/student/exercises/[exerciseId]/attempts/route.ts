import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { ExerciseAttempt } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

interface CreateAttemptRequest {
  prompt: string;
  studentEmail: string;
  caseStudyContext: string;
  previousAttempts: string[];
}

interface CreateAttemptResponse {
  attempt: ExerciseAttempt;
}

// POST /api/student/exercises/[exerciseId]/attempts - Create new exercise attempt with AI response
async function postHandler(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }): Promise<CreateAttemptResponse> {
  const { exerciseId } = await params;
  const body: CreateAttemptRequest = await req.json();
  const { prompt, studentEmail, caseStudyContext, previousAttempts } = body;

  if (!prompt || !studentEmail) {
    throw new Error('Prompt and student email are required');
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
          createdBy: studentEmail,
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
  const isEnrolled = exercise.module.caseStudy.enrollments.some((enrollment) =>
    enrollment.students.some((student) => student.assignedStudentId === studentEmail)
  );

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

    // Build context for AI
    let aiContext = `You are an AI assistant helping business students with case study exercises.

Case Study Context:
${caseStudyContext}

Current Exercise:
Title: ${exercise.title}
Description: ${exercise.shortDescription}
Details: ${exercise.details}

`;

    // Add previous attempts context if any
    if (previousAttempts && previousAttempts.length > 0) {
      aiContext += `\nPrevious AI responses in this module:\n`;
      previousAttempts.forEach((response, index) => {
        aiContext += `${index + 1}. ${response}\n\n`;
      });
    }

    aiContext += `\nStudent's current prompt: ${prompt}

Please provide a helpful, educational response that guides the student through the business analysis. Focus on practical insights and encourage critical thinking.`;

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
        createdBy: studentEmail,
        updatedBy: studentEmail,
        attemptNumber: nextAttemptNumber,
        model: 'gemini-2.5-pro',
        prompt,
        promptResponse: aiResponse,
        status: 'completed',
        archive: false,
      },
    });

    return { attempt };
  } catch (error) {
    // Create failed attempt record
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        exerciseId,
        createdBy: studentEmail,
        updatedBy: studentEmail,
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
async function getHandler(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }): Promise<ExerciseAttempt[]> {
  const { exerciseId } = await params;
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  const attempts = await prisma.exerciseAttempt.findMany({
    where: {
      exerciseId,
      createdBy: studentEmail,
      archive: false,
    },
    orderBy: {
      attemptNumber: 'asc',
    },
  });

  return attempts;
}

export const POST = withErrorHandlingV2<CreateAttemptResponse>(postHandler);
export const GET = withErrorHandlingV2<ExerciseAttempt[]>(getHandler);
