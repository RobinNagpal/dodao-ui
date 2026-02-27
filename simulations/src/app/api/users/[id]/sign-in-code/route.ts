import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUserAndActivityLog } from '@/middleware/withActivityLogging';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { createSignInCodeForUser } from '@/utils/sign-in-code-utils';
import { requireAdminOrInstructorUser } from '@/utils/user-utils';
import { StudentSignInCode } from '@prisma/client';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface GenerateSignInCodeResponse {
  message: string;
}

/**
 * GET /api/users/[id]/sign-in-code
 * Fetch the current active sign-in code for any user
 * Only admins and instructors can fetch codes
 */
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<StudentSignInCode | null> {
  const { id: targetUserId } = await params;
  const { userId } = userContext;

  await requireAdminOrInstructorUser(userId);

  const activeCode = await prisma.studentSignInCode.findFirst({
    where: {
      userId: targetUserId,
      isActive: true,
    },
  });

  return activeCode;
}

/**
 * POST /api/users/[id]/sign-in-code
 * Generate a new sign-in code for any user
 * Only admins and instructors can generate codes
 */
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<GenerateSignInCodeResponse> {
  const { id: targetUserId } = await params;
  const { userId } = userContext;

  await requireAdminOrInstructorUser(userId);

  // Verify the target user exists
  const targetUser = await prisma.user.findFirstOrThrow({
    where: { id: targetUserId },
  });

  // Deactivate all existing codes for this user
  await prisma.studentSignInCode.updateMany({
    where: {
      userId: targetUserId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Create a new sign-in code
  const newSignInCode = await createSignInCodeForUser(
    targetUserId,
    userContext.userId,
    30 // 30 days expiration
  );

  return {
    message: 'New sign-in code generated successfully',
  };
}

export const GET = withLoggedInUser<StudentSignInCode | null>(getHandler);
export const POST = withLoggedInUserAndActivityLog<GenerateSignInCodeResponse>(postHandler);
