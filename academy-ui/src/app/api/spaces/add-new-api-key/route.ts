import { MutationAddNewApiKeyArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getSpaceWithIntegrations } from '../../helpers/space';

async function postHandler(req: NextRequest) {
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

export const POST = withErrorHandling(postHandler);
