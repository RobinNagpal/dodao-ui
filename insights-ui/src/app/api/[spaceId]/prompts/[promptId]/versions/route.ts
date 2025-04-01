// app/api/[spaceId]/prompts/[promptId]/versions/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface CreatePromptVersionRequest {
  version: number;
  promptTemplate: string;
  commitMessage?: string;
  createdBy?: string;
}

// GET /api/[spaceId]/prompts/[promptId]/versions
async function getVersions(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = context.params;
  const versions = await prisma.promptVersion.findMany({
    where: {
      spaceId,
      promptId,
    },
    orderBy: {
      version: 'asc',
    },
  });
  return versions;
}

// POST /api/[spaceId]/prompts/[promptId]/versions
async function createVersion(req: NextRequest, context: { params: { spaceId: string; promptId: string } }) {
  const { spaceId, promptId } = context.params;
  const body: CreatePromptVersionRequest = await req.json();

  // Check if version already exists
  const existing = await prisma.promptVersion.findUnique({
    where: { promptId_version: { promptId, version: body.version } },
  });
  if (existing) {
    throw new Error(`Prompt version ${body.version} already exists for this prompt.`);
  }

  // Query the highest version for this prompt & space
  const lastVersion = await prisma.promptVersion.findFirst({
    where: { promptId, spaceId },
    orderBy: { version: 'desc' },
  });

  const newVersionNumber = lastVersion ? lastVersion.version + 1 : 1;

  const newVersion = await prisma.promptVersion.create({
    data: {
      spaceId,
      promptId,
      version: newVersionNumber,
      promptTemplate: body.promptTemplate,
      commitMessage: body.commitMessage ?? null,
      createdBy: body.createdBy ?? 'unknown',
      updatedBy: body.createdBy ?? 'unknown',
    },
  });
  await prisma.prompt.update({
    where: { id: promptId },
    data: { activePromptVersionId: newVersion.id },
  });
  return newVersion;
}

export const GET = withErrorHandlingV2(getVersions);
export const POST = withErrorHandlingV2(createVersion);
