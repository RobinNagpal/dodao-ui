// app/api/[spaceId]/prompts/[promptId]/invocations/[invocationId]/route.ts
import { Prompt, PromptInvocation, PromptVersion } from '@prisma/client';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { resolveEtfPromptTemplateByKey } from '@/utils/etf-analysis-reports/etf-prompt-template-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// GET /api/[spaceId]/prompts/[promptId]/invocations/[invocationId]

export type FullPromptInvocationResponse = PromptInvocation & {
  prompt: Prompt & { promptVersions: PromptVersion[]; activePromptVersion: PromptVersion | null };
};

async function getInvocation(req: NextRequest, context: { params: Promise<{ spaceId: string; promptId: string; invocationId: string }> }) {
  const { spaceId, promptId, invocationId } = await context.params;

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
        include: {
          activePromptVersion: true,
        },
      },
    },
  });

  // For the file-backed ETF prompts the runtime template comes from the
  // markdown file, not the DB version, so show that here instead of the stale
  // DB copy. No-op for every other prompt.
  const activeVersion = invocation.prompt.activePromptVersion;
  if (activeVersion) {
    activeVersion.promptTemplate = resolveEtfPromptTemplateByKey(invocation.prompt.key, activeVersion.promptTemplate);
  }

  return invocation;
}

export const GET = withErrorHandlingV2(getInvocation);
