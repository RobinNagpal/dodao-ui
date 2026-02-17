import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUserAndActivityLog } from '@/middleware/withActivityLogging';
import { FinalSummaryResponse } from '@/types/api';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface CreateFinalSummaryRequest {
  caseStudyId: string;
  studentEmail: string;
}

interface FinalSummaryData {
  id: string;
  response: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/student/final-summary/[caseStudyId] - Get final summary data for student
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<FinalSummaryResponse> {
  const { caseStudyId } = await params;

  // Get comprehensive case study data
  const caseStudy = await prisma.caseStudy.findFirstOrThrow({
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
              assignedStudentId: userContext.userId,
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
                  createdById: userContext.userId,
                  status: 'completed',
                  selectedForSummary: true,
                  archive: false,
                },
                orderBy: {
                  attemptNumber: 'asc',
                },
                take: 1, // Only get the first selected attempt
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

  // Build the summary data - only include exercises with selected attempts
  const modules = caseStudy.modules
    .map((module) => ({
      orderNumber: module.orderNumber,
      title: module.title,
      shortDescription: module.shortDescription,
      details: module.details,
      exercises: module.exercises
        .filter((exercise) => exercise.attempts.length > 0) // Only include exercises with selected attempts
        .map((exercise) => ({
          orderNumber: exercise.orderNumber,
          title: exercise.title,
          details: exercise.details,
          selectedAttempt: exercise.attempts[0]
            ? {
                prompt: exercise.attempts[0].prompt,
                promptResponse: exercise.attempts[0].promptResponse,
              }
            : null, // Get the first (and should be only) selected attempt
        })),
    }))
    .filter((module) => module.exercises.length > 0); // Only include modules with exercises that have selected attempts

  return {
    caseStudy: {
      title: caseStudy.title,
      shortDescription: caseStudy.shortDescription,
      details: caseStudy.details,
    },
    modules,
  };
}

// POST /api/student/final-summary/[caseStudyId] - Generate and save final summary
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<FinalSummaryData> {
  const { caseStudyId } = await params;
  const body: CreateFinalSummaryRequest = await req.json();
  const { studentEmail } = body;

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Find the enrollment student record
  const enrollmentStudent = await prisma.enrollmentStudent.findFirst({
    where: {
      assignedStudentId: userContext.userId,
      archive: false,
      enrollment: {
        caseStudyId: caseStudyId,
        archive: false,
      },
    },
  });

  if (!enrollmentStudent) {
    throw new Error('Student is not enrolled in this case study');
  }

  // Get comprehensive case study data to build the markdown content
  const caseStudy = await prisma.caseStudy.findFirstOrThrow({
    where: {
      id: caseStudyId,
      archive: false,
    },
    include: {
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
                  createdById: userContext.userId,
                  status: 'completed',
                  selectedForSummary: true,
                  archive: false,
                },
                orderBy: {
                  attemptNumber: 'asc',
                },
                take: 1, // Only get the first selected attempt
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

  // Build the final summary content in markdown format
  let finalSummaryContent = `# ${caseStudy.title}\n\n`;
  finalSummaryContent += `${caseStudy.shortDescription}\n\n`;
  finalSummaryContent += `---\n\n`;

  // Filter modules to only include those with selected attempts
  const modulesWithAttempts = caseStudy.modules
    .map((module) => ({
      ...module,
      exercises: module.exercises.filter((exercise) => exercise.attempts.length > 0),
    }))
    .filter((module) => module.exercises.length > 0);

  modulesWithAttempts.forEach((module, moduleIndex) => {
    finalSummaryContent += `## Module ${module.orderNumber}: ${module.title}\n\n`;

    module.exercises.forEach((exercise, exerciseIndex) => {
      finalSummaryContent += `### Exercise ${exercise.orderNumber}: ${exercise.title}\n\n`;

      if (exercise.attempts[0]?.prompt) {
        finalSummaryContent += `**Student Prompt:**\n\n`;
        finalSummaryContent += `${exercise.attempts[0].prompt}\n\n`;
      }

      if (exercise.attempts[0]?.promptResponse) {
        finalSummaryContent += `**Selected Response:**\n\n`;
        finalSummaryContent += `${exercise.attempts[0].promptResponse}\n\n`;
      }

      finalSummaryContent += `---\n\n`;
    });
  });

  // Add generation timestamp
  finalSummaryContent += `*Final report generated on ${new Date().toLocaleString()}*\n`;

  // Check if final summary already exists
  const existingSummary = await prisma.finalSummary.findFirst({
    where: {
      studentId: enrollmentStudent.id,
    },
  });

  if (existingSummary) {
    // Update existing summary
    const updatedSummary = await prisma.finalSummary.update({
      where: {
        id: existingSummary.id,
      },
      data: {
        response: finalSummaryContent,
        status: 'completed',
        model: 'system-generated', // Indicate this was generated by the system
        updatedById: userContext.userId,
        archive: false,
      },
    });

    return updatedSummary;
  } else {
    // Create new summary
    const newSummary = await prisma.finalSummary.create({
      data: {
        studentId: enrollmentStudent.id,
        response: finalSummaryContent,
        status: 'completed',
        model: 'system-generated', // Indicate this was generated by the system
        createdById: userContext.userId,
        updatedById: userContext.userId,
        archive: false,
      },
    });

    return newSummary;
  }
}

export const GET = withLoggedInUser<FinalSummaryResponse>(getHandler);
export const POST = withLoggedInUserAndActivityLog<FinalSummaryData>(postHandler);
