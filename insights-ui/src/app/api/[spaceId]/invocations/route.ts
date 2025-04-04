// app/api/[spaceId]/invocations/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// GET /api/[spaceId]/invocations
async function getPromptInvocations(req: NextRequest, context: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await context.params;
  const promptInvocations = await prisma.promptInvocation.findMany({
    where: { spaceId },
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
