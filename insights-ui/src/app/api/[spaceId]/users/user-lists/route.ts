import { prisma } from '@/prisma';
import { CreateUserListRequest, UpdateUserListRequest, UserListResponse, UserListsResponse } from '@/types/ticker-user';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { NextRequest } from 'next/server';

// GET /api/user-lists - Get all lists for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<UserListsResponse> {
  const { userId } = userContext;

  const lists = await prisma.userTickerList.findMany({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return { lists: lists as UserListResponse[] };
}

// POST /api/user-lists - Create a new list
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<UserListResponse> {
  const { userId } = userContext;
  const body: CreateUserListRequest = await req.json();

  const list = await prisma.userTickerList.create({
    data: {
      name: body.name,
      description: body.description,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
      createdBy: userId,
    },
  });

  return list as UserListResponse;
}

// PUT /api/user-lists?id={listId} - Update a list
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<UserListResponse> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const listId = searchParams.get('id');

  if (!listId) {
    throw new Error('List ID is required');
  }

  // Verify the list belongs to the user
  const existingList = await prisma.userTickerList.findFirst({
    where: {
      id: listId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!existingList) {
    throw new Error('List not found or you do not have permission to update it');
  }

  const body: UpdateUserListRequest = await req.json();

  const updatedList = await prisma.userTickerList.update({
    where: {
      id: listId,
    },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      description: body.description !== undefined ? body.description : undefined,
    },
  });

  return updatedList as UserListResponse;
}

// DELETE /api/user-lists?id={listId} - Delete a list
async function deleteHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const listId = searchParams.get('id');

  if (!listId) {
    throw new Error('List ID is required');
  }

  // Verify the list belongs to the user
  const existingList = await prisma.userTickerList.findFirst({
    where: {
      id: listId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!existingList) {
    throw new Error('List not found or you do not have permission to delete it');
  }

  await prisma.userTickerList.delete({
    where: {
      id: listId,
    },
  });

  return { success: true };
}

export const GET = withLoggedInUser<UserListsResponse>(getHandler);
export const POST = withLoggedInUser<UserListResponse>(postHandler);
export const PUT = withLoggedInUser<UserListResponse>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
