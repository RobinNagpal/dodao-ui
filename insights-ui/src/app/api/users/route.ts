import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { User, UserRole } from '@prisma/client';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../helpers/withLoggedInAdmin';

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

export interface UsersResponse {
  users: UserResponse[];
}

export interface UserCreationResponse {
  user: User;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  username?: string;
  role?: UserRole;
}

async function getHandler(req: NextRequest, userContext: KoalaGainsJwtTokenPayload): Promise<UsersResponse> {
  const users = await prisma.user.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
    },
  });

  return { users: users as UserResponse[] };
}

async function postHandler(request: NextRequest, userContext: KoalaGainsJwtTokenPayload): Promise<UserCreationResponse> {
  const body = await request.json();
  const { email, name, role } = body;

  if (!email) {
    throw new Error('Email is required');
  }

  const user = await prisma.user.create({
    data: {
      email: email,
      name: name || null,
      spaceId: KoalaGainsSpaceId,
      username: email,
      authProvider: 'custom-email',
      role: role || 'Student',
    },
  });

  return { user: user };
}

export const GET = withLoggedInAdmin<UsersResponse>(getHandler);
export const POST = withLoggedInAdmin<UserCreationResponse>(postHandler);
