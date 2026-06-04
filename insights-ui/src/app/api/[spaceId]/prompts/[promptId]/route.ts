// app/api/[spaceId]/prompts/[promptId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withAdminOrToken } from '@/app/api/helpers/withAdminOrToken';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { KoalaGainsJwtTokenPayload } from '@/types/auth';
import { Prisma, Prompt, PromptVersion } from '@prisma/client';

export interface UpdatePromptRequest {
  name: string;
  key: string;
  excerpt: string;
  inputSchema?: string;
  outputSchema: string;
  sampleJson?: string;
  updatedBy?: string;
  sampleBodyToAppend?: string;
  transformationPatch?: Prisma.JsonValue;
  notes?: string;
}

export type FullPromptResponse = Prompt & { promptVersions: PromptVersion[]; activePromptVersion: PromptVersion | null };

// GET /api/[spaceId]/prompts/[promptId]
async function getPrompt(req: NextRequest, context: { params: Promise<{ spaceId: string; promptId: string }> }) {
  const { spaceId, promptId } = await context.params;

  const prompt: FullPromptResponse = await prisma.prompt.findFirstOrThrow({
    where: {
      id: promptId,
      spaceId,
    },
    include: {
      promptVersions: true,
      activePromptVersion: true,
    },
  });
  return prompt;
}

// PUT /api/[spaceId]/prompts/[promptId]
async function updatePrompt(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  context: { params: Promise<{ spaceId: string; promptId: string }> }
) {
  const { spaceId, promptId } = await context.params;
  const body: UpdatePromptRequest = await req.json();

  const updatedPrompt = await prisma.prompt.update({
    where: { id: promptId },
    data: {
      name: body.name,
      key: body.key,
      excerpt: body.excerpt,
      inputSchema: body.inputSchema,
      outputSchema: body.outputSchema,
      sampleJson: body.sampleJson,
      sampleBodyToAppend: body.sampleBodyToAppend,
      updatedBy: body.updatedBy,
      notes: body.notes,
      transformationPatch: body.transformationPatch || undefined,
    },
  });
  return updatedPrompt;
}

// DELETE /api/[spaceId]/prompts/[promptId]
async function deletePrompt(
  req: NextRequest,
  _userContext: KoalaGainsJwtTokenPayload | null,
  context: { params: Promise<{ spaceId: string; promptId: string }> }
) {
  const { spaceId, promptId } = await context.params;

  // Could do business logic checks here (e.g., if versions exist, etc.)
  const deleted = await prisma.prompt.delete({
    where: { id: promptId },
  });
  return deleted;
}

export const GET = withErrorHandlingV2(getPrompt);
export const PUT = withAdminOrToken(updatePrompt);
export const DELETE = withAdminOrToken(deletePrompt);
