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
  articlesCount?: number;
};

/**
 * GET handler for retrieving all news topics
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to an array of NewsTopicWithRelations objects
 */
async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<NewsTopicWithRelations[]> {
  const { userId } = userContext;
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  // Build the where clause based on query parameters
  const where: any = {};
  if (folderId) {
    where.folderId = folderId;
  }

  const topics = await prisma.newsTopic.findMany({
    where,
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform the result to include article count
  const topicsWithArticleCount = topics.map((topic) => ({
    ...topic,
    articlesCount: topic.articles.length,
    articles: undefined, // Remove the articles array
  }));

  return topicsWithArticleCount;
}

/**
 * POST handler for creating a new news topic
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to the created NewsTopic object
 */
async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<NewsTopic> {
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

  const newTopic = await prisma.newsTopic.create({
    data: {
      topic,
      description,
      filters,
      templateUsed,
      folderId,
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      folder: true,
    },
  });

  return newTopic;
}

export const GET = withLoggedInUser<NewsTopicWithRelations[]>(getHandler);
export const POST = withLoggedInUser<NewsTopic>(postHandler);
