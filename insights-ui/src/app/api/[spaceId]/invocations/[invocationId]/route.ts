// app/api/[spaceId]/prompts/[promptId]/invocations/[invocationId]/route.ts
import { Prompt, PromptInvocation } from '@prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// GET /api/[spaceId]/prompts/[promptId]/invocations/[invocationId]
export type FullPromptInvocationResponse = PromptInvocation & { prompt: Prompt };

async function getInvocation(req: NextRequest, context: { params: { spaceId: string; invocationId: string } }) {
  const { spaceId, invocationId } = context.params;

  const invocation = await prisma.promptInvocation.findFirstOrThrow({
    where: {
      id: invocationId,
      spaceId,
    },
    include: {
      prompt: true,
    },
  });
  return invocation;
}

export const GET = withErrorHandlingV2(getInvocation);
