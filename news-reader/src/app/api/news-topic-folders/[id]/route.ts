import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NewsTopicFolder } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * GET handler for retrieving a news topic folder by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the NewsTopicFolder object
 */
async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ id: string }> }): Promise<NewsTopicFolder> {
  const { id } = await params;

  const folder = await prisma.newsTopicFolder.findUniqueOrThrow({
    where: { id },
    include: {
      children: true,
      topics: true,
      parent: true,
    },
  });

  return folder;
}

/**
 * PUT handler for updating a news topic folder by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the updated NewsTopicFolder object
 */
async function putHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ id: string }> }): Promise<NewsTopicFolder> {
  const { id } = await params;
  const { userId } = userContext;
  const { name, parentId } = (await request.json()) as {
    name: string;
    parentId: string | null;
  };

  // Validate required fields
  if (!name) {
    throw new Error('Missing required field: name is required');
  }

  // Prevent circular references
  if (parentId === id) {
    throw new Error('A folder cannot be its own parent');
  }

  // If parentId is provided, verify it exists and is not a descendant of this folder
  if (parentId) {
    const parentFolder = await prisma.newsTopicFolder.findUnique({
      where: { id: parentId },
    });

    if (!parentFolder) {
      throw new Error(`Parent folder with ID ${parentId} not found`);
    }

    // Check if the new parent is a descendant of this folder (would create a cycle)
    const isDescendant = await isDescendantFolder(id, parentId);
    if (isDescendant) {
      throw new Error('Cannot set a descendant folder as parent (would create a cycle)');
    }
  }

  const updatedFolder = await prisma.newsTopicFolder.update({
    where: { id },
    data: {
      name,
      parentId,
      updatedBy: userId,
    },
    include: {
      children: true,
      topics: true,
      parent: true,
    },
  });

  return updatedFolder;
}

/**
 * DELETE handler for deleting a news topic folder by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the deleted NewsTopicFolder object
 */
async function deleteHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<NewsTopicFolder> {
  const { id } = await params;

  // Check if the folder has children
  const childrenCount = await prisma.newsTopicFolder.count({
    where: {
      parentId: id,
    },
  });

  if (childrenCount > 0) {
    throw new Error(`Cannot delete folder: it has ${childrenCount} child folders`);
  }

  // Check if the folder has topics
  const topicsCount = await prisma.newsTopic.count({
    where: {
      folderId: id,
    },
  });

  if (topicsCount > 0) {
    throw new Error(`Cannot delete folder: it contains ${topicsCount} topics`);
  }

  const deletedFolder = await prisma.newsTopicFolder.delete({
    where: { id },
    include: {
      parent: true,
    },
  });

  return deletedFolder;
}

/**
 * Helper function to check if a folder is a descendant of another folder
 * @param ancestorId - The potential ancestor folder ID
 * @param descendantId - The potential descendant folder ID
 * @returns A promise that resolves to a boolean indicating if descendantId is a descendant of ancestorId
 */
async function isDescendantFolder(ancestorId: string, descendantId: string): Promise<boolean> {
  const folder = await prisma.newsTopicFolder.findUnique({
    where: { id: descendantId },
    select: { parentId: true },
  });

  if (!folder || !folder.parentId) {
    return false;
  }

  if (folder.parentId === ancestorId) {
    return true;
  }

  return isDescendantFolder(ancestorId, folder.parentId);
}

export const GET = withLoggedInUser<NewsTopicFolder>(getHandler);
export const PUT = withLoggedInUser<NewsTopicFolder>(putHandler);
export const DELETE = withLoggedInUser<NewsTopicFolder>(deleteHandler);
