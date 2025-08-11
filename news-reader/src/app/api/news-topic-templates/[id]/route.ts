import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NewsTopicTemplate } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * GET handler for retrieving a news topic template by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the NewsTopicTemplate object
 */
async function getHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<NewsTopicTemplate> {
  const { id } = params;

  const template = await prisma.newsTopicTemplate.findUniqueOrThrow({
    where: { id },
    include: {
      topics: true,
    },
  });

  return template;
}

/**
 * PUT handler for updating a news topic template by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the updated NewsTopicTemplate object
 */
async function putHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<NewsTopicTemplate> {
  const { id } = params;
  const { userId } = userContext;
  const { name, description, filters, availableFilters, isDefault } = (await request.json()) as {
    name: string;
    description: string;
    filters: string[];
    availableFilters: string[];
    isDefault: boolean;
  };

  // Validate required fields
  if (!name || !description || !filters || filters.length === 0 || !availableFilters || availableFilters.length === 0) {
    throw new Error('Missing required fields: name, description, filters, and availableFilters are required');
  }

  const updatedTemplate = await prisma.newsTopicTemplate.update({
    where: { id },
    data: {
      name,
      description,
      filters,
      availableFilters,
      isDefault,
      updatedBy: userId,
    },
    include: {
      topics: true,
    },
  });

  return updatedTemplate;
}

/**
 * DELETE handler for deleting a news topic template by ID
 * @param request - The Next.js request object
 * @param userContext - The authenticated user context
 * @param params - The route parameters containing the ID
 * @returns A promise that resolves to the deleted NewsTopicTemplate object
 */
async function deleteHandler(request: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: { id: string } }): Promise<NewsTopicTemplate> {
  const { id } = params;

  // Check if the template is used by any topics
  const topicsUsingTemplate = await prisma.newsTopic.count({
    where: {
      newsTopicTemplateId: id,
    },
  });

  if (topicsUsingTemplate > 0) {
    throw new Error(`Cannot delete template: it is used by ${topicsUsingTemplate} topics`);
  }

  const deletedTemplate = await prisma.newsTopicTemplate.delete({
    where: { id },
    include: {
      topics: true,
    },
  });

  return deletedTemplate;
}

export const GET = withLoggedInUser<NewsTopicTemplate>(getHandler);
export const PUT = withLoggedInUser<NewsTopicTemplate>(putHandler);
export const DELETE = withLoggedInUser<NewsTopicTemplate>(deleteHandler);
