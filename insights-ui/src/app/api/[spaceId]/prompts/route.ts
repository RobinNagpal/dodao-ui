// app/api/[spaceId]/prompts/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma, Prompt, PromptVersion } from '@prisma/client';

// Type for the body when creating a prompt
interface CreatePromptRequest {
  name: string;
  key: string;
  excerpt: string;
  inputSchema: string;
  outputSchema: string;
  sampleJson: string;
  createdBy?: string;
  sampleBodyToAppend?: string;
  transformationPatch?: Prisma.JsonValue;
}

export type PromptWithActiveVersion = Prompt & { activePromptVersion: PromptVersion | null };

// GET /api/[spaceId]/prompts
async function getPrompts(req: NextRequest, context: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await context.params;
  const prompts = await prisma.prompt.findMany({
    where: { spaceId },
    include: {
      activePromptVersion: true, // show some relation if needed
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return prompts;
}

// POST /api/[spaceId]/prompts
async function createPrompt(req: NextRequest, context: { params: Promise<{ spaceId: string }> }) {
  const { spaceId } = await context.params;
  const body: CreatePromptRequest = await req.json();

  // Basic validation
  if (!body.name || !body.key) {
    throw new Error('Missing required fields: name, key');
  }

  // Check for duplicates
  const existing = await prisma.prompt.findUnique({
    where: {
      spaceId_key: {
        key: body.key,
        spaceId: spaceId,
      },
    },
  });
  if (existing) {
    throw new Error(`Prompt with key "${body.key}" already exists`);
  }

  const newPrompt = await prisma.prompt.create({
    data: {
      spaceId,
      name: body.name,
      key: body.key,
      excerpt: body.excerpt || '',
      inputSchema: body.inputSchema || '',
      outputSchema: body.outputSchema || '',
      sampleJson: body.sampleJson || '',
      createdBy: body.createdBy || 'unknown',
      updatedBy: body.createdBy || 'unknown',
      sampleBodyToAppend: body.sampleBodyToAppend || '',
      transformationPatch: body.transformationPatch || undefined,
    },
  });

  return newPrompt;
}

export const GET = withErrorHandlingV2(getPrompts);
export const POST = withErrorHandlingV2(createPrompt);
