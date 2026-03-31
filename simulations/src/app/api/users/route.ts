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

export interface PaginatedUsersResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

async function getHandler(req: NextRequest, userContext: SimulationJwtTokenPayload): Promise<PaginatedUsersResponse> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const skip = (page - 1) * limit;

  // Default sort by createdAt ascending
  const sortBy = url.searchParams.get('sortBy') || 'createdAt';
  const sortOrder = url.searchParams.get('sortOrder') || 'asc';

  // Optional role filter
  const roleParam = url.searchParams.get('role');
  const validRoles = Object.values(UserRole);
  const roleFilter = roleParam && validRoles.includes(roleParam as UserRole) ? (roleParam as UserRole) : undefined;

  // Validate and sanitize sort parameters
  const validSortFields = ['createdAt', 'email', 'username', 'name'];
  const validSortOrders = ['asc', 'desc'];

  const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'asc';

  const whereClause = {
    spaceId: KoalaGainsSpaceId,
    ...(roleFilter && { role: roleFilter }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: [{ [finalSortBy]: finalSortOrder }, { email: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.user.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users: users as UserResponse[],
    total,
    page,
    limit,
    totalPages,
  };
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

export const GET = withLoggedInAdmin<PaginatedUsersResponse>(getHandler);
export const POST = withLoggedInAdmin<UserCreationResponse>(postHandler);
