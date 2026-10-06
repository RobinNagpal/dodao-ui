import { prisma } from '@/prisma';
import { badRequestError } from '@dodao/web-core/api/errors/badRequestError';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';

export interface UserResponse {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  publicAddress?: string | null;
  phoneNumber?: string | null;
  spaceId: string;
  username: string;
  authProvider: string;
  role: UserRole;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  username?: string;
  role?: UserRole;
}

async function putHandler(
  request: NextRequest,
  userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<UserResponse> {
  const { id } = await params;
  const body: UserUpdateRequest = await request.json();
  const { name, email, role } = body;

  // If email is provided, update username to match
  const username = email;

  const updatedUser = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      ...(name && { name }),
      ...(email && { email, username: email }),
      ...(role && { role }),
    },
  });

  return updatedUser as UserResponse;
}

async function deleteHandler(
  request: NextRequest,
  userContext: KoalaGainsJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<{ success: boolean }> {
  const { id } = await params;

  // Credit purchases and paid runs are financial records and block the delete (ON DELETE RESTRICT).
  const [purchases, spends] = await Promise.all([
    prisma.stripeCreditPurchase.count({ where: { userId: id } }),
    prisma.reportSpend.count({ where: { userId: id } }),
  ]);
  if (purchases > 0 || spends > 0) {
    throw badRequestError(
      `This user has ${purchases} credit purchase(s) and ${spends} report run(s); their credit records must be kept, so the user can't be deleted.`
    );
  }

  await prisma.user.delete({
    where: {
      id: id,
    },
  });

  return { success: true };
}

export const PUT = withLoggedInAdmin<UserResponse>(putHandler);
export const DELETE = withLoggedInAdmin<{ success: boolean }>(deleteHandler);
