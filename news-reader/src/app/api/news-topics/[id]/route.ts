import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NewsTopic } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Type for NewsTopic with related entities
 */
export type NewsTopicWithRelations = NewsTopic & {
  folder?: {
    id: string;
    name: string;
  } | null;
  articles?: {
    id: string;
    title: string;
    publishedAt: Date;
  }[];
};

/**
 * GET handler for retrieving a news topic by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the NewsTopicWithRelations object
 */
async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<NewsTopicWithRelations> {
  const { id } = params;

  const topic = await prisma.newsTopic.findUniqueOrThrow({
    where: { id },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
      articles: {
        select: {
          id: true,
          title: true,
          publishedAt: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
      },
    },
  });

  return topic;
}

/**
 * PUT handler for updating a news topic by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the updated NewsTopicWithRelations object
 */
async function putHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<NewsTopicWithRelations> {
  const { id } = params;
  const { userId } = userContext;
  const { topic, description, filters, templateUsed, folderId } = (await request.json()) as {
    topic: string;
    description: string;
    filters: string[];
    templateUsed: string;
    folderId: string | null;
  };

  // Validate required fields
  if (!topic || !description || !filters || filters.length === 0 || !templateUsed) {
    throw new Error('Missing required fields: topic, description, filters, and templateUsed are required');
  }

  // If folderId is provided, verify it exists
  if (folderId) {
    const folder = await prisma.newsTopicFolder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new Error(`Folder with ID ${folderId} not found`);
    }
  }

  const updatedTopic = await prisma.newsTopic.update({
    where: { id },
    data: {
      topic,
      description,
      filters,
      templateUsed,
      folderId,
      updatedBy: userId,
    },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
      articles: {
        select: {
          id: true,
          title: true,
          publishedAt: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
      },
    },
  });

  return updatedTopic;
}

/**
 * DELETE handler for deleting a news topic by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the deleted NewsTopicWithRelations object
 */
async function deleteHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<NewsTopicWithRelations> {
  const { id } = params;

  // Check if the topic has articles
  const articlesCount = await prisma.newsArticle.count({
    where: {
      topicId: id,
    },
  });

  if (articlesCount > 0) {
    throw new Error(`Cannot delete topic: it has ${articlesCount} articles. Delete the articles first.`);
  }

  const deletedTopic = await prisma.newsTopic.delete({
    where: { id },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return deletedTopic;
}

export const GET = withLoggedInUser<NewsTopicWithRelations>(getHandler);
export const PUT = withLoggedInUser<NewsTopicWithRelations>(putHandler);
export const DELETE = withLoggedInUser<NewsTopicWithRelations>(deleteHandler);
