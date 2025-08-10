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
  sourcesCount?: number;
};

/**
 * GET handler for retrieving all news articles
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to an array of NewsArticleWithRelations objects
 */
async function getHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload
): Promise<NewsArticleWithRelations[]> {
  const { userId } = userContext;
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topicId');
  const keyword = searchParams.get('keyword');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

  // Build the where clause based on query parameters
  const where: any = {};
  if (topicId) {
    where.topicId = topicId;
  }
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
      { keyword: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: {
      topic: {
        select: {
          id: true,
          topic: true,
        },
      },
      sources: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    skip: offset,
    take: limit,
  });

  // Transform the result to include sources count
  const articlesWithSourcesCount = articles.map((article) => ({
    ...article,
    sourcesCount: article.sources.length,
    sources: undefined, // Remove the sources array
  }));

  return articlesWithSourcesCount;
}

/**
 * POST handler for creating a new news article
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to the created NewsArticle object
 */
async function postHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload
): Promise<NewsArticle> {
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

  // Create article with sources if provided
  const article = await prisma.newsArticle.create({
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
      createdBy: userId,
      updatedBy: userId,
      sources: sources
        ? {
            create: sources.map((s) => ({
              title: s.title,
              url: s.url,
              source: s.source,
              percentage: s.percentage,
              publishedAt: new Date(s.publishedAt),
              createdBy: userId,
              updatedBy: userId,
            })),
          }
        : undefined,
    },
    include: {
      topic: true,
      sources: true,
    },
  });

  return article;
}

export const GET = withLoggedInUser<NewsArticleWithRelations[]>(getHandler);
export const POST = withLoggedInUser<NewsArticle>(postHandler);
