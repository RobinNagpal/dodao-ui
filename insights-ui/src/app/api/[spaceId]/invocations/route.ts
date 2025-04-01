// app/api/[spaceId]/prompts/[promptId]/invocations/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { PromptInvocationStatus } from '.prisma/client';

interface CreateInvocationRequest {
  promptVersionId: string;
  inputJson?: string;
  status?: string;
  error?: string;
  createdBy?: string;
}

// GET /api/[spaceId]/prompts/[promptId]/invocations
async function getInvocations(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = context.params;
  const invocations = await prisma.promptInvocation.findMany({
    where: {
      spaceId,
      promptVersion: {
        promptId: promptId,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return invocations;
}

// POST /api/[spaceId]/prompts/[promptId]/invocations
async function createInvocation(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = context.params;
  const body: CreateInvocationRequest = await req.json();

  // Basic check
  if (!body.promptVersionId) {
    throw new Error('Missing promptVersionId');
  }

  // Validate that version belongs to the prompt
  const versionRecord = await prisma.promptVersion.findFirstOrThrow({
    where: {
      id: body.promptVersionId,
      promptId,
      spaceId,
    },
  });

  // Create
  const invocation = await prisma.promptInvocation.create({
    data: {
      spaceId,
      promptId: versionRecord.promptId,
      outputJson: '',
      promptVersionId: versionRecord.id,
      inputJson: body.inputJson || '',
      status: (body.status as PromptInvocationStatus) || PromptInvocationStatus.InProgress,
      error: body.error || '',
      createdBy: body.createdBy || 'unknown',
      updatedBy: body.createdBy || 'unknown',
    },
  });
  return invocation;
}

export const GET = withErrorHandlingV2(getInvocations);
export const POST = withErrorHandlingV2(createInvocation);
