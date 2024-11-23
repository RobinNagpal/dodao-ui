import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { getSpaceWithIntegrations } from '@/app/api/helpers/getSpaceWithIntegrations';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { MutationUpdateTidbitsHomepageArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { SpaceTags } from '@/utils/api/fetchTags';
import { Space, SpaceIntegration } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest): Promise<NextResponse<{ space: SpaceWithIntegrationsDto }>> {
  const { spaceId, tidbitsHomepage } = (await req.json()) as MutationUpdateTidbitsHomepageArgs;
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  await prisma.space.update({
    data: {
      tidbitsHomepage: {
        heading: tidbitsHomepage.heading,
        shortDescription: tidbitsHomepage.shortDescription,
      },
    },
    where: {
      id: spaceId,
    },
  });

  revalidateTag(SpaceTags.GET_SPACE.toString());
  const space = await getSpaceWithIntegrations(spaceId);

  return NextResponse.json({ space }, { status: 200 });
}

export const POST = withErrorHandlingV1<{ space: SpaceWithIntegrationsDto }>(postHandler);
