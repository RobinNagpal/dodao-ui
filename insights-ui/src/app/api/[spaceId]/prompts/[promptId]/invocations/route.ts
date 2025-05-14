import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { PromptInvocationStatus, Prisma } from '.prisma/client';

async function getPromptInvocations(req: NextRequest, context: { params: Promise<{ spaceId: string; promptId: string }> }) {
  const { spaceId, promptId } = await context.params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  // Build type-safe where clause using Prisma.PromptInvocationWhereInput
  const whereClause: Prisma.PromptInvocationWhereInput = {
    spaceId,
    promptVersion: {
      promptId,
    },
  };

  // Add status filter if provided - validate that it's a valid PromptInvocationStatus
  if (status && Object.values(PromptInvocationStatus).includes(status as PromptInvocationStatus)) {
    whereClause.status = status as PromptInvocationStatus;
  }

  const promptInvocations = await prisma.promptInvocation.findMany({
    where: whereClause,
    orderBy: {
      updatedAt: 'desc',
    },
    take: 50,
    include: {
      prompt: {
        select: {
          name: true,
          key: true,
        },
      },
    },
  });

  return promptInvocations;
}

export const GET = withErrorHandlingV2(getPromptInvocations);
