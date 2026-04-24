import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
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
  createdAt: Date;
  hasPortfolioManagerProfile: boolean;
  favouriteItemsCount: number;
}

export interface UsersResponse {
  users: UserResponse[];
  totalCount: number;
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
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));
  const roleParam = searchParams.get('role');
  const isManagerParam = searchParams.get('isManager');
  const isActiveParam = searchParams.get('isActive');

  const where: Record<string, unknown> = {
    spaceId: KoalaGainsSpaceId,
  };

  if (roleParam && roleParam !== 'All' && Object.values(UserRole).includes(roleParam as UserRole)) {
    where.role = roleParam as UserRole;
  }

  if (isManagerParam === 'true') {
    where.portfolioManagerProfile = { isNot: null };
  }

  if (isActiveParam === 'true') {
    where.OR = [{ favouriteTickers: { some: {} } }, { tickerNotes: { some: {} } }];
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        portfolioManagerProfile: {
          select: { id: true },
        },
        _count: {
          select: { favouriteTickers: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const usersResponse: UserResponse[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    publicAddress: user.publicAddress,
    phoneNumber: user.phoneNumber,
    spaceId: user.spaceId,
    username: user.username,
    authProvider: user.authProvider,
    role: user.role,
    createdAt: user.createdAt,
    hasPortfolioManagerProfile: !!user.portfolioManagerProfile,
    favouriteItemsCount: user._count.favouriteTickers,
  }));

  return { users: usersResponse, totalCount };
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
      role: role || UserRole.FreeUser,
    },
  });

  return { user: user };
}

export const GET = withLoggedInAdmin<UsersResponse>(getHandler);
export const POST = withLoggedInAdmin<UserCreationResponse>(postHandler);
