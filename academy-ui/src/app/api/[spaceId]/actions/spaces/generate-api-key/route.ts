import { withErrorHandling, withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { MutationAddNewApiKeyArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { CreateSpaceResponse } from '@/types/response/CreateSpaceResponse';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Space, SpaceIntegration } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<{ space: SpaceWithIntegrationsDto }>> {
  const { spaceId, creator, apiKey } = (await req.json()) as MutationAddNewApiKeyArgs;
  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  // Step 1: Fetch the current SpaceIntegration
  const currentIntegration = await prisma.spaceIntegration.findUnique({
    where: {
      spaceId: spaceId,
    },
  });
  const newApiKey = {
    creator: creator,
    apiKey: apiKey,
    lastFourLetters: apiKey.slice(-4),
  };
  // Step 2: Append the new API key
  const updatedApiKeys = [...currentIntegration!.spaceApiKeys, newApiKey];

  // Step 3: Update the SpaceIntegration with the new keys array
  const updatedIntegration = await prisma.spaceIntegration.update({
    where: {
      spaceId: spaceId,
    },
    data: {
      spaceApiKeys: updatedApiKeys,
    },
  });
  const space = await getSpaceWithIntegrations(spaceId);

  return NextResponse.json({ space: space }, { status: 200 });
}

export const POST = withErrorHandlingV1<{ space: SpaceWithIntegrationsDto }>(postHandler);
