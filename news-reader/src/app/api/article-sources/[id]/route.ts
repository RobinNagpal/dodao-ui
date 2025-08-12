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
 * GET handler for retrieving an article source by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the ArticleSourceWithRelations object
 */
async function getHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<ArticleSourceWithRelations> {
  const { id } = await params;

  const source = await prisma.articleSource.findUniqueOrThrow({
    where: { id },
    include: {
      article: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return source;
}

/**
 * PUT handler for updating an article source by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the updated ArticleSourceWithRelations object
 */
async function putHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<ArticleSourceWithRelations> {
  const { id } = await params;
  const { userId } = userContext;
  const { title, url, source, percentage, publishedAt, articleId } = (await request.json()) as {
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

  // Update article source
  const updatedSource = await prisma.articleSource.update({
    where: { id },
    data: {
      title,
      url,
      source,
      percentage,
      publishedAt: new Date(publishedAt),
      articleId,
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

  return updatedSource;
}

/**
 * DELETE handler for deleting an article source by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the deleted ArticleSourceWithRelations object
 */
async function deleteHandler(
  request: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<ArticleSourceWithRelations> {
  const { id } = await params;

  // Delete the article source
  const deletedSource = await prisma.articleSource.delete({
    where: { id },
    include: {
      article: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return deletedSource;
}

export const GET = withLoggedInUser<ArticleSourceWithRelations>(getHandler);
export const PUT = withLoggedInUser<ArticleSourceWithRelations>(putHandler);
export const DELETE = withLoggedInUser<ArticleSourceWithRelations>(deleteHandler);
