import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

interface CreateFinalSubmissionRequest {
  caseStudyId: string;
  finalContent: string;
  studentEmail: string;
}

interface FinalSubmissionResponse {
  id: string;
  finalContent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// POST /api/student/final-submission - Create or update final submission
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<FinalSubmissionResponse> {
  const body: CreateFinalSubmissionRequest = await req.json();
  const { caseStudyId, finalContent, studentEmail } = body;

  if (!caseStudyId || !finalContent || !studentEmail) {
    throw new Error('Case study ID, final content, and student email are required');
  }

  // Find the enrollment student record
  const enrollmentStudent = await prisma.enrollmentStudent.findFirst({
    where: {
      assignedStudentId: studentEmail,
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

  // Check if final submission already exists
  const existingSubmission = await prisma.finalSubmission.findFirst({
    where: {
      studentId: enrollmentStudent.id,
    },
  });

  if (existingSubmission) {
    // Update existing submission
    const updatedSubmission = await prisma.finalSubmission.update({
      where: {
        id: existingSubmission.id,
      },
      data: {
        finalContent,
        updatedById: userContext.userId,
        archive: false,
      },
    });

    return updatedSubmission;
  } else {
    // Create new submission
    const newSubmission = await prisma.finalSubmission.create({
      data: {
        studentId: enrollmentStudent.id,
        finalContent,
        createdById: userContext.userId,
        updatedById: userContext.userId,
        archive: false,
      },
    });

    return newSubmission;
  }
}

// GET /api/student/final-submission - Get existing final submission
async function getHandler(req: NextRequest): Promise<FinalSubmissionResponse | null> {
  const url = new URL(req.url);
  const caseStudyId = url.searchParams.get('caseStudyId');
  const studentEmail = url.searchParams.get('studentEmail');

  if (!caseStudyId || !studentEmail) {
    throw new Error('Case study ID and student email are required');
  }

  // Find the enrollment student record
  const enrollmentStudent = await prisma.enrollmentStudent.findFirst({
    where: {
      assignedStudentId: studentEmail,
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

  // Get existing final submission
  const submission = await prisma.finalSubmission.findFirst({
    where: {
      studentId: enrollmentStudent.id,
      archive: false,
    },
  });

  return submission;
}

export const GET = withLoggedInUser<FinalSubmissionResponse | null>(getHandler);
export const POST = withLoggedInUser<FinalSubmissionResponse>(postHandler);
