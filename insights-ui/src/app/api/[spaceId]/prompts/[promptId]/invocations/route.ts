import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

async function getPromptInvocations(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = await context.params;
  const promptInvocations = await prisma.promptInvocation.findMany({
    where: {
      spaceId,
      promptVersion: {
        promptId,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
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
