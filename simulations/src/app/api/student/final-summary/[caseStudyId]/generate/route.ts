import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2, withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { generateAIResponse } from '@/utils/llm-utils';

interface GenerateSummaryRequest {
  prompt: string;
}

interface GenerateSummaryResponse {
  summary: {
    id: string;
    response: string | null;
    status: string | null;
    error: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

// POST /api/student/final-summary/[caseStudyId]/generate - Generate final summary using AI
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<GenerateSummaryResponse> {
  const { caseStudyId } = await params;
  const body: GenerateSummaryRequest = await req.json();
  const { prompt } = body;

  if (!prompt) {
    throw new Error('Prompt is required');
  }

  // Find the enrollment student record to verify access using user context
  const enrollmentStudent = await prisma.enrollmentStudent.findFirst({
    where: {
      assignedStudentId: userContext.userId,
      enrollment: {
        caseStudyId: caseStudyId,
        archive: false,
      },
      archive: false,
    },
  });

  if (!enrollmentStudent) {
    throw new Error('Student not enrolled in this case study');
  }

  try {
    // Use the shared AI generation utility (includes grounding)
    const aiResponse = await generateAIResponse(prompt);

    // Create or update the final summary record
    const summary = await prisma.finalSummary.upsert({
      where: {
        studentId: enrollmentStudent.id,
      },
      create: {
        studentId: enrollmentStudent.id,
        model: 'gemini-2.5-pro',
        response: aiResponse,
        status: 'completed',
        createdById: userContext.userId,
        updatedById: userContext.userId,
        archive: false,
      },
      update: {
        model: 'gemini-2.5-pro',
        response: aiResponse,
        status: 'completed',
        error: null,
        updatedById: userContext.userId,
      },
    });

    return {
      summary: {
        id: summary.id,
        response: summary.response,
        status: summary.status,
        error: summary.error,
        createdAt: summary.createdAt.toISOString(),
        updatedAt: summary.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    // Create or update failed summary record
    const summary = await prisma.finalSummary.upsert({
      where: {
        studentId: enrollmentStudent.id,
      },
      create: {
        studentId: enrollmentStudent.id,
        model: 'gemini-2.5-pro',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        createdById: userContext.userId,
        updatedById: userContext.userId,
        archive: false,
      },
      update: {
        model: 'gemini-2.5-pro',
        response: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        updatedById: userContext.userId,
      },
    });

    throw new Error(`Failed to generate final summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withLoggedInUser<GenerateSummaryResponse>(postHandler);
