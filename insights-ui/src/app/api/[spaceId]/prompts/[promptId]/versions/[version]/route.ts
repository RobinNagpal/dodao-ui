// app/api/[spaceId]/prompts/[promptId]/versions/[version]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface UpdatePromptVersionRequest {
  promptTemplate?: string;
  commitMessage?: string;
  updatedBy?: string;
}

// GET /api/[spaceId]/prompts/[promptId]/versions/[version]
async function getPromptVersion(req: NextRequest, context: { params: { spaceId: string; promptId: string; version: string } }) {
  const { spaceId, promptId, version } = context.params;
  const intVersion = parseInt(version, 10);

  const record = await prisma.promptVersion.findUniqueOrThrow({
    where: { promptId_version: { promptId, version: intVersion } },
  });
  return record;
}

// PUT /api/[spaceId]/prompts/[promptId]/versions/[version]
async function updatePromptVersion(req: NextRequest, context: { params: Promise<{ spaceId: string; promptId: string; version: string }> }) {
  const { spaceId, promptId, version } = await context.params;
  const intVersion = parseInt(version, 10);
  const body: UpdatePromptVersionRequest = await req.json();

  const updatedVersion = await prisma.promptVersion.update({
    where: { promptId_version: { promptId, version: intVersion } },
    data: {
      promptTemplate: body.promptTemplate,
      commitMessage: body.commitMessage,
      updatedBy: body.updatedBy,
    },
  });
  return updatedVersion;
}

// DELETE /api/[spaceId]/prompts/[promptId]/versions/[version]
async function deletePromptVersion(req: NextRequest, context: { params: { spaceId: string; promptId: string; version: string } }) {
  const { spaceId, promptId, version } = context.params;
  const intVersion = parseInt(version, 10);

  const del = await prisma.promptVersion.delete({
    where: { promptId_version: { promptId, version: intVersion } },
  });
  return del;
}

export const GET = withErrorHandlingV2(getPromptVersion);
export const PUT = withErrorHandlingV2(updatePromptVersion);
export const DELETE = withErrorHandlingV2(deletePromptVersion);
