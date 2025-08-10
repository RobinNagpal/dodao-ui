import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NewsTopicTemplate } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * GET handler for retrieving all news topic templates
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to an array of NewsTopicTemplate objects
 */
async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<NewsTopicTemplate[]> {
  const { userId } = userContext;

  const templates = await prisma.newsTopicTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return templates;
}

/**
 * POST handler for creating a new news topic template
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @returns A promise that resolves to the created NewsTopicTemplate object
 */
async function postHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<NewsTopicTemplate> {
  const { userId } = userContext;
  const { name, description, filters, isDefault } = (await request.json()) as {
    name: string;
    description: string;
    filters: string[];
    isDefault: boolean;
  };

  // Validate required fields
  if (!name || !description || !filters || filters.length === 0) {
    throw new Error('Missing required fields: name, description, and filters are required');
  }

  const template = await prisma.newsTopicTemplate.create({
    data: {
      name,
      description,
      filters,
      isDefault,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return template;
}

export const GET = withLoggedInUser<NewsTopicTemplate[]>(getHandler);
export const POST = withLoggedInUser<NewsTopicTemplate>(postHandler);
