import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { GoogleGenAI } from '@google/genai';

interface GenerateSummaryRequest {
  studentEmail: string;
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
async function postHandler(req: NextRequest, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<GenerateSummaryResponse> {
  const { caseStudyId } = await params;
  const body: GenerateSummaryRequest = await req.json();
  const { studentEmail, prompt } = body;

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  if (!prompt) {
    throw new Error('Prompt is required');
  }

  // Find the enrollment student record to verify access
  const enrollmentStudent = await prisma.enrollmentStudent.findFirst({
    where: {
      assignedStudentId: studentEmail,
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
    // Configure Gemini AI
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

    const groundingTool = { googleSearch: {} };
    const config = { tools: [groundingTool] };

    console.log('Final Summary Prompt Length:', prompt.length);

    // Make AI request with the provided prompt
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config,
    });

    const aiResponse = response.text;

    console.log('AI Summary Response Length:', aiResponse?.length);

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
        createdBy: studentEmail,
        updatedBy: studentEmail,
        archive: false,
      },
      update: {
        model: 'gemini-2.5-pro',
        response: aiResponse,
        status: 'completed',
        error: null,
        updatedBy: studentEmail,
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
        createdBy: studentEmail,
        updatedBy: studentEmail,
        archive: false,
      },
      update: {
        model: 'gemini-2.5-pro',
        response: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        updatedBy: studentEmail,
      },
    });

    throw new Error(`Failed to generate final summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST = withErrorHandlingV2<GenerateSummaryResponse>(postHandler);
