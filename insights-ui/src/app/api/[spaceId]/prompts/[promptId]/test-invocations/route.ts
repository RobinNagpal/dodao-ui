import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

async function getTestPromptInvocations(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = await context.params;
  const testInvocations = await prisma.testPromptInvocation.findMany({
    where: {
      spaceId,
      promptId,
    },
    orderBy: { updatedAt: 'desc' },
    take: 25,
  });
  return testInvocations;
}

export const GET = withErrorHandlingV2(getTestPromptInvocations);
