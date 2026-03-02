import { prisma } from '@/prisma';
import { SimulationJwtTokenPayload } from '@/types/user';
import { createNewUser } from '@/utils/user-utils';
import { User, UserRole } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
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

async function getHandler(req: NextRequest, userContext: SimulationJwtTokenPayload): Promise<UsersResponse> {
  const users = await prisma.user.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
    },
  });

  return { users: users as UserResponse[] };
}

async function postHandler(request: NextRequest, userContext: SimulationJwtTokenPayload): Promise<UserCreationResponse> {
  const body = await request.json();
  const { email, name, role } = body;

  if (!email) {
    throw new Error('Email is required');
  }

  const user = await createNewUser({ email, name, role });

  return { user: user };
}

export const GET = withLoggedInAdmin<UsersResponse>(getHandler);
export const POST = withLoggedInAdmin<UserCreationResponse>(postHandler);
