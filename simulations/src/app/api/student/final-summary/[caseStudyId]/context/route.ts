import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface SummaryContextResponse {
  caseStudy: {
    title: string;
    shortDescription: string;
    details: string;
  };
  modules: Array<{
    title: string;
    shortDescription: string;
    details: string;
    exercises: Array<{
      title: string;
      shortDescription: string;
      details: string;
      attempts: Array<{
        promptResponse: string | null;
      }>;
    }>;
  }>;
  finalSummaryPromptInstructions: string | null;
  fullPrompt: string;
}

// GET /api/student/final-summary/[caseStudyId]/context - Get context for final summary generation
async function getHandler(req: NextRequest, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<SummaryContextResponse> {
  const { caseStudyId } = await params;
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Get comprehensive case study data
  const caseStudy = await prisma.caseStudy.findFirst({
    where: {
      id: caseStudyId,
      archive: false,
    },
    include: {
      enrollments: {
        where: {
          archive: false,
        },
        include: {
          students: {
            where: {
              assignedStudentId: studentEmail,
              archive: false,
            },
          },
        },
      },
      modules: {
        where: {
          archive: false,
        },
        include: {
          exercises: {
            where: {
              archive: false,
            },
            include: {
              attempts: {
                where: {
                  createdBy: studentEmail,
                  status: 'completed',
                  archive: false,
                },
                orderBy: {
                  attemptNumber: 'asc',
                },
              },
            },
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
        orderBy: {
          orderNumber: 'asc',
        },
      },
    },
  });

  if (!caseStudy) {
    throw new Error('Case study not found');
  }

  // Check if student is enrolled
  const isEnrolled = caseStudy.enrollments.some((enrollment) => enrollment.students.some((student) => student.assignedStudentId === studentEmail));

  if (!isEnrolled) {
    throw new Error('Student is not enrolled in this case study');
  }

  // Get final summary prompt instructions
  const enrollment = caseStudy.enrollments[0];
  const finalSummaryPromptInstructions = enrollment?.finalSummaryPromptInstructions || null;

  // Build the comprehensive context
  const modules = caseStudy.modules.map((module) => ({
    title: module.title,
    shortDescription: module.shortDescription,
    details: module.details,
    exercises: module.exercises.map((exercise) => ({
      title: exercise.title,
      shortDescription: exercise.shortDescription,
      details: exercise.details,
      attempts: exercise.attempts.map((attempt) => ({
        promptResponse: attempt.promptResponse,
      })),
    })),
  }));

  // Build the full prompt that will be sent to AI
  let fullPrompt = '';

  // Add professor instructions if available
  if (finalSummaryPromptInstructions) {
    fullPrompt += `# Professor Instructions\n\n${finalSummaryPromptInstructions}\n\n`;
  }

  // Add case study context
  fullPrompt += `# Case Study: ${caseStudy.title}\n\n`;
  fullPrompt += `**Description:** ${caseStudy.shortDescription}\n\n`;
  fullPrompt += `**Details:**\n${caseStudy.details}\n\n`;

  // Add modules and exercises
  modules.forEach((module, moduleIndex) => {
    fullPrompt += `## Module ${moduleIndex + 1}: ${module.title}\n\n`;
    fullPrompt += `**Description:** ${module.shortDescription}\n\n`;
    fullPrompt += `**Details:**\n${module.details}\n\n`;

    module.exercises.forEach((exercise, exerciseIndex) => {
      fullPrompt += `### Exercise ${exerciseIndex + 1}: ${exercise.title}\n\n`;
      fullPrompt += `**Description:** ${exercise.shortDescription}\n\n`;
      fullPrompt += `**Details:**\n${exercise.details}\n\n`;

      if (exercise.attempts.length > 0) {
        exercise.attempts.forEach((attempt, attemptIndex) => {
          if (attempt.promptResponse) {
            fullPrompt += `*Exercise Solution ${attemptIndex + 1}:*\n${attempt.promptResponse}\n\n`;
          }
        });
      }
    });
  });

  return {
    caseStudy: {
      title: caseStudy.title,
      shortDescription: caseStudy.shortDescription,
      details: caseStudy.details,
    },
    modules,
    finalSummaryPromptInstructions,
    fullPrompt,
  };
}

export const GET = withErrorHandlingV2<SummaryContextResponse>(getHandler);
