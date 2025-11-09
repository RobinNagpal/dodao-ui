import { prisma } from '@/prisma';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { CreateUserTickerTagRequest, UpdateUserTickerTagRequest, UserTickerTagResponse, UserTickerTagsResponse } from '@/types/ticker-user';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

// GET /api/user-ticker-tags - Get all tags for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<UserTickerTagsResponse> {
  const { userId } = userContext;

  const tags = await prisma.userTickerTag.findMany({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return { tags: tags as UserTickerTagResponse[] };
}

// POST /api/user-ticker-tags - Create a new tag
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<UserTickerTagResponse> {
  const { userId } = userContext;
  const body: CreateUserTickerTagRequest = await req.json();

  const tag = await prisma.userTickerTag.create({
    data: {
      name: body.name,
      description: body.description,
      colorHex: body.colorHex,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
      createdBy: userId,
    },
  });

  return tag as UserTickerTagResponse;
}

// PUT /api/user-ticker-tags?id={tagId} - Update a tag
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<UserTickerTagResponse> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const tagId = searchParams.get('id');

  if (!tagId) {
    throw new Error('Tag ID is required');
  }

  // Verify the tag belongs to the user
  const existingTag = await prisma.userTickerTag.findFirst({
    where: {
      id: tagId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!existingTag) {
    throw new Error('Tag not found or you do not have permission to update it');
  }

  const body: UpdateUserTickerTagRequest = await req.json();

  const updatedTag = await prisma.userTickerTag.update({
    where: {
      id: tagId,
    },
    data: {
      name: body.name !== undefined ? body.name : undefined,
      description: body.description !== undefined ? body.description : undefined,
      colorHex: body.colorHex !== undefined ? body.colorHex : undefined,
    },
  });

  return updatedTag as UserTickerTagResponse;
}

// DELETE /api/user-ticker-tags?id={tagId} - Delete a tag
async function deleteHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const tagId = searchParams.get('id');

  if (!tagId) {
    throw new Error('Tag ID is required');
  }

  // Verify the tag belongs to the user
  const existingTag = await prisma.userTickerTag.findFirst({
    where: {
      id: tagId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!existingTag) {
    throw new Error('Tag not found or you do not have permission to delete it');
  }

  await prisma.userTickerTag.delete({
    where: {
      id: tagId,
    },
  });

  return { success: true };
}

export const GET = withLoggedInUser<UserTickerTagsResponse>(getHandler);
export const POST = withLoggedInUser<UserTickerTagResponse>(postHandler);
export const PUT = withLoggedInUser<UserTickerTagResponse>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
