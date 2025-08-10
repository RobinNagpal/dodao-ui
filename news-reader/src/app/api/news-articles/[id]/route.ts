import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NewsArticle } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Type for NewsArticle with related entities
 */
export type NewsArticleWithRelations = NewsArticle & {
  topic: {
    id: string;
    topic: string;
  };
  sources: Array<{
    id: string;
    title: string;
    url: string;
    source: string;
    percentage: number;
    publishedAt: Date;
  }>;
};

/**
 * GET handler for retrieving a news article by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the NewsArticleWithRelations object
 */
async function getHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: { id: string } }
): Promise<NewsArticleWithRelations> {
  const { id } = params;

  const article = await prisma.newsArticle.findUniqueOrThrow({
    where: { id },
    include: {
      topic: {
        select: {
          id: true,
          topic: true,
        },
      },
      sources: true,
    },
  });

  return article;
}

/**
 * PUT handler for updating a news article by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the updated NewsArticleWithRelations object
 */
async function putHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: { id: string } }
): Promise<NewsArticleWithRelations> {
  const { id } = params;
  const { userId } = userContext;
  const {
    title,
    description,
    keyword,
    filters,
    source,
    publishedAt,
    url,
    fullContent,
    topicId,
    sources,
  } = await request.json() as {
    title: string;
    description: string;
    keyword: string;
    filters: string[];
    source: string;
    publishedAt: string;
    url: string;
    fullContent?: string;
    topicId: string;
    sources?: Array<{
      id?: string;
      title: string;
      url: string;
      source: string;
      percentage: number;
      publishedAt: string;
    }>;
  };

  // Validate required fields
  if (!title || !description || !keyword || !filters || !source || !publishedAt || !url || !topicId) {
    throw new Error('Missing required fields: title, description, keyword, filters, source, publishedAt, url, and topicId are required');
  }

  // Verify topic exists
  const topic = await prisma.newsTopic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw new Error(`Topic with ID ${topicId} not found`);
  }

  // First, delete existing sources to avoid duplicates
  if (sources) {
    // Get existing sources that are not in the updated list
    const existingSources = await prisma.articleSource.findMany({
      where: {
        articleId: id,
      },
      select: {
        id: true,
      },
    });

    const updatedSourceIds = sources
      .filter((s) => s.id)
      .map((s) => s.id as string);

    const sourcesToDelete = existingSources
      .filter((s) => !updatedSourceIds.includes(s.id))
      .map((s) => s.id);

    // Delete sources that are not in the updated list
    if (sourcesToDelete.length > 0) {
      await prisma.articleSource.deleteMany({
        where: {
          id: {
            in: sourcesToDelete,
          },
        },
      });
    }

    // Update existing sources and create new ones
    for (const source of sources) {
      if (source.id) {
        // Update existing source
        await prisma.articleSource.update({
          where: { id: source.id },
          data: {
            title: source.title,
            url: source.url,
            source: source.source,
            percentage: source.percentage,
            publishedAt: new Date(source.publishedAt),
            updatedBy: userId,
          },
        });
      } else {
        // Create new source
        await prisma.articleSource.create({
          data: {
            title: source.title,
            url: source.url,
            source: source.source,
            percentage: source.percentage,
            publishedAt: new Date(source.publishedAt),
            articleId: id,
            createdBy: userId,
            updatedBy: userId,
          },
        });
      }
    }
  }

  // Update the article
  const updatedArticle = await prisma.newsArticle.update({
    where: { id },
    data: {
      title,
      description,
      keyword,
      filters,
      source,
      publishedAt: new Date(publishedAt),
      url,
      fullContent,
      topicId,
      updatedBy: userId,
    },
    include: {
      topic: {
        select: {
          id: true,
          topic: true,
        },
      },
      sources: true,
    },
  });

  return updatedArticle;
}

/**
 * DELETE handler for deleting a news article by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the deleted NewsArticleWithRelations object
 */
async function deleteHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: { id: string } }
): Promise<NewsArticleWithRelations> {
  const { id } = params;

  // First, delete all associated sources
  await prisma.articleSource.deleteMany({
    where: {
      articleId: id,
    },
  });

  // Then delete the article
  const deletedArticle = await prisma.newsArticle.delete({
    where: { id },
    include: {
      topic: {
        select: {
          id: true,
          topic: true,
        },
      },
      sources: true, // This will be empty since we deleted all sources
    },
  });

  return deletedArticle;
}

export const GET = withLoggedInUser<NewsArticleWithRelations>(getHandler);
export const PUT = withLoggedInUser<NewsArticleWithRelations>(putHandler);
export const DELETE = withLoggedInUser<NewsArticleWithRelations>(deleteHandler);
