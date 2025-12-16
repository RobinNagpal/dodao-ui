// API route to fetch prompts by keys
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prompt, PromptVersion } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export type PromptWithVersion = Prompt & { activePromptVersion: PromptVersion | null };

interface GetPromptsByKeysResponse {
  prompts: PromptWithVersion[];
}

// GET /api/prompts/by-keys?keys=key1,key2,key3
async function getPromptsByKeys(req: NextRequest): Promise<GetPromptsByKeysResponse> {
  const { searchParams } = new URL(req.url);
  const keysParam = searchParams.get('keys');

  if (!keysParam) {
    throw new Error('Missing required parameter: keys');
  }

  const keys = keysParam.split(',');

  const prompts = await prisma.prompt.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      key: {
        in: keys,
      },
    },
    include: {
      activePromptVersion: true,
    },
  });

  return { prompts };
}

export const GET = withErrorHandlingV2<GetPromptsByKeysResponse>(getPromptsByKeys);
