import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ArticleSource } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Type for ArticleSource with related entities
 */
export type ArticleSourceWithRelations = ArticleSource & {
  article: {
    id: string;
    title: string;
  };
};

/**
 * GET handler for retrieving all article sources
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to an array of ArticleSourceWithRelations objects
 */
async function getHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload
): Promise<ArticleSourceWithRelations[]> {
  const { userId } = userContext;
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  const source = searchParams.get('source');

  // Build the where clause based on query parameters
  const where: any = {};
  if (articleId) {
    where.articleId = articleId;
  }
  if (source) {
    where.source = { contains: source, mode: 'insensitive' };
  }

  const sources = await prisma.articleSource.findMany({
    where,
    include: {
      article: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  return sources;
}

/**
 * POST handler for creating a new article source
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to the created ArticleSource object
 */
async function postHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload
): Promise<ArticleSource> {
  const { userId } = userContext;
  const {
    title,
    url,
    source,
    percentage,
    publishedAt,
    articleId,
  } = await request.json() as {
    title: string;
    url: string;
    source: string;
    percentage: number;
    publishedAt: string;
    articleId: string;
  };

  // Validate required fields
  if (!title || !url || !source || percentage === undefined || !publishedAt || !articleId) {
    throw new Error('Missing required fields: title, url, source, percentage, publishedAt, and articleId are required');
  }

  // Verify article exists
  const article = await prisma.newsArticle.findUnique({
    where: { id: articleId },
  });

  if (!article) {
    throw new Error(`Article with ID ${articleId} not found`);
  }

  // Create article source
  const articleSource = await prisma.articleSource.create({
    data: {
      title,
      url,
      source,
      percentage,
      publishedAt: new Date(publishedAt),
      articleId,
      createdBy: userId,
      updatedBy: userId,
    },
    include: {
      article: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return articleSource;
}

export const GET = withLoggedInUser<ArticleSourceWithRelations[]>(getHandler);
export const POST = withLoggedInUser<ArticleSource>(postHandler);
