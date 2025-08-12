import { prisma } from '@/prisma';
import { ROOT_FOLDER } from '@/lib/news-reader-types';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NewsTopicFolder } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Type for NewsTopicFolder with nested children
 */
export type NewsTopicFolderWithChildren = NewsTopicFolder & {
  children: NewsTopicFolderWithChildren[];
  topics?: number;
};

/**
 * GET handler for retrieving all news topic folders
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to an array of NewsTopicFolderWithChildren objects
 */
async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<NewsTopicFolderWithChildren[]> {
  const { userId } = userContext;

  // Get all folders
  const allFolders = await prisma.newsTopicFolder.findMany({
    include: {
      children: true,
      topics: {
        select: {
          id: true,
        },
      },
    },
  });

  // Count topics in each folder
  const foldersWithTopicCount = allFolders.map((folder) => ({
    ...folder,
    topics: folder.topics.length,
    children: [],
  }));

  // Build folder hierarchy
  const rootFolders = foldersWithTopicCount.filter((folder) => folder.parentId === null);

  // Recursive function to build the folder tree
  const buildFolderTree = (parentId: string | null): NewsTopicFolderWithChildren[] => {
    return foldersWithTopicCount
      .filter((folder) => folder.parentId === parentId)
      .map((folder) => ({
        ...folder,
        children: buildFolderTree(folder.id),
      }));
  };

  // Build the complete folder tree starting from root folders
  const folderTree = rootFolders.map((rootFolder) => ({
    ...rootFolder,
    children: buildFolderTree(rootFolder.id),
  }));

  return folderTree;
}

/**
 * POST handler for creating a new news topic folder
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to the created NewsTopicFolder object
 */
async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<NewsTopicFolder> {
  const { userId } = userContext;
  let { name, parentId } = (await request.json()) as {
    name: string;
    parentId: string | null;
  };

  // If parentId is ROOT_FOLDER, set it to null
  if (parentId === ROOT_FOLDER) {
    parentId = null;
  }

  // Validate required fields
  if (!name) {
    throw new Error('Missing required field: name is required');
  }

  // If parentId is provided, verify it exists
  if (parentId) {
    const parentFolder = await prisma.newsTopicFolder.findUnique({
      where: { id: parentId },
    });

    if (!parentFolder) {
      throw new Error(`Parent folder with ID ${parentId} not found`);
    }
  }

  const folder = await prisma.newsTopicFolder.create({
    data: {
      name,
      parentId,
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      children: true,
      topics: true,
    },
  });

  return folder;
}

export const GET = withLoggedInUser<NewsTopicFolderWithChildren[]>(getHandler);
export const POST = withLoggedInUser<NewsTopicFolder>(postHandler);
