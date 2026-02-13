import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { createSignInCodeForUser } from '@/utils/sign-in-code-utils';
import { StudentSignInCode } from '@prisma/client';

interface GenerateSignInCodeResponse {
  code: string;
  message: string;
}

/**
 * GET /api/users/[id]/sign-in-code
 * Fetch the current active sign-in code for a student
 * Only admins and instructors can fetch codes
 */
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<StudentSignInCode | null> {
  const { id: studentId } = await params;
  const { userId } = userContext;

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (currentUser.role !== 'Instructor' && currentUser.role !== 'Admin') {
    throw new Error('Only instructors and admins can fetch sign-in codes');
  }

  const activeCode = await prisma.studentSignInCode.findFirst({
    where: {
      userId: studentId,
      isActive: true,
    },
  });

  return activeCode;
}

/**
 * POST /api/users/[id]/sign-in-code
 * Generate a new sign-in code for a student
 * Only admins and instructors can generate codes
 */
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<GenerateSignInCodeResponse> {
  const { id: studentId } = await params;
  const { userId } = userContext;

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (currentUser.role !== 'Instructor' && currentUser.role !== 'Admin') {
    throw new Error('Only instructors and admins can generate sign-in codes');
  }

  // Verify the target user exists and is a student
  const targetUser = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!targetUser) {
    throw new Error('User not found');
  }

  if (targetUser.role !== 'Student') {
    throw new Error('Sign-in codes can only be generated for students');
  }

  // Deactivate all existing codes for this user
  await prisma.studentSignInCode.updateMany({
    where: {
      userId: studentId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Create a new sign-in code
  const newSignInCode = await createSignInCodeForUser(
    studentId,
    userContext.userId,
    30 // 30 days expiration
  );

  return {
    code: newSignInCode.code,
    message: 'New sign-in code generated successfully',
  };
}

export const GET = withLoggedInUser<StudentSignInCode | null>(getHandler);
export const POST = withLoggedInUser<GenerateSignInCodeResponse>(postHandler);
