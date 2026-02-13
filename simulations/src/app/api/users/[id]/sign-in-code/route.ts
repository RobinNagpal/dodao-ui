import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { SimulationJwtTokenPayload } from '@/types/user';
import { createSignInCodeForUser } from '@/utils/sign-in-code-utils';

interface GenerateSignInCodeResponse {
  code: string;
  message: string;
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
  const { id: userId } = await params;
  const simulationUserContext = userContext as SimulationJwtTokenPayload;

  // Verify the requesting user is an admin or instructor
  if (!simulationUserContext.role) {
    const user = await prisma.user.findUnique({
      where: {
        email_spaceId: {
          email: simulationUserContext.email || simulationUserContext.username,
          spaceId: simulationUserContext.spaceId,
        },
      },
    });

    if (!user || (user.role !== 'Admin' && user.role !== 'Instructor')) {
      throw new Error('Unauthorized: Only admins and instructors can generate sign-in codes');
    }
  } else if (simulationUserContext.role !== 'Admin' && simulationUserContext.role !== 'Instructor') {
    throw new Error('Unauthorized: Only admins and instructors can generate sign-in codes');
  }

  // Verify the target user exists and is a student
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
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
      userId: userId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Create a new sign-in code
  const newSignInCode = await createSignInCodeForUser(
    userId,
    userContext.userId,
    30 // 30 days expiration
  );

  return {
    code: newSignInCode.code,
    message: 'New sign-in code generated successfully',
  };
}

export const POST = withLoggedInUser<GenerateSignInCodeResponse>(postHandler);
