// app/api/[spaceId]/prompts/[promptId]/invocations/[invocationId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// GET /api/[spaceId]/prompts/[promptId]/invocations/[invocationId]
async function getInvocation(req: NextRequest, context: { params: { spaceId: string; promptId: string; invocationId: string } }) {
  const { spaceId, promptId, invocationId } = context.params;

  const invocation = await prisma.promptInvocation.findFirstOrThrow({
    where: {
      id: invocationId,
      spaceId,
      promptVersion: {
        promptId,
      },
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
  return invocation;
}

export const GET = withErrorHandlingV2(getInvocation);
