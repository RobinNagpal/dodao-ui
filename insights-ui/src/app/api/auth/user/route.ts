import { prisma } from '@/prisma';

import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Session } from '@dodao/web-core/types/auth/Session';
import { User, UserRole } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from '../[...nextauth]/authOptions';

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

export interface UserCreationResponse {
  user: User;
}

async function getHandler(req: NextRequest): Promise<UserResponse> {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findFirst({
    where: {
      username: session.username,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user as UserResponse;
}

async function putHandler(request: NextRequest): Promise<UserResponse> {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }
  const { name, email, phoneNumber, username } = await request.json();

  if (username !== session.username) {
    throw new Error('Unauthorized');
  }

  const updatedUser = await prisma.user.update({
    where: { username_spaceId: { username: session.username, spaceId: KoalaGainsSpaceId } },
    data: { email: email },
  });

  return updatedUser as UserResponse;
}

async function postHandler(request: NextRequest): Promise<UserCreationResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }
  const body = await request.json();
  const { spaceId, ...userData } = body;

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      spaceId: KoalaGainsSpaceId,
      username: userData.email,
      authProvider: 'custom-email',
    },
  });

  return { user: user };
}

export const POST = withErrorHandlingV2<UserCreationResponse>(postHandler);
export const GET = withErrorHandlingV2<UserResponse>(getHandler);
export const PUT = withErrorHandlingV2<UserResponse>(putHandler);
