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
            include: {
              assignedStudent: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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

  // Get student information - Alternative approach: Query User directly
  let studentInfo = null;

  const enrollmentStudent = caseStudy.enrollments[0]?.students[0];
  if (enrollmentStudent?.assignedStudent) {
    studentInfo = enrollmentStudent.assignedStudent;
  } else {
    // Fallback: Query user directly since userContext.userId should be the student ID
    const user = await prisma.user.findUnique({
      where: { id: userContext.userId },
      select: { id: true, name: true, email: true },
    });
    studentInfo = user;
  }

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
    student: {
      name: studentInfo?.name || null,
      email: studentInfo?.email || null,
    },
    modules,
  };
}

export const GET = withLoggedInUser<FinalSummaryResponse>(getHandler);
