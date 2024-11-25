import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { getSpaceWithIntegrations } from '@/app/api/helpers/getSpaceWithIntegrations';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { UpsertByteSettingsRequest } from '@/types/request/space/UpsertByteSettingsRequest';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { SpaceTags } from '@/utils/api/fetchTags';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

async function putHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<SpaceWithIntegrationsDto>> {
  const input = (await req.json()) as UpsertByteSettingsRequest;
  const spaceId = (await params).spaceId;
  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  await prisma.space.update({
    data: {
      byteSettings: {
        askForLoginToSubmit: input.askForLoginToSubmit,
        captureRating: input.captureRating,
        showCategoriesInSidebar: input.showCategoriesInSidebar,
        byteViewMode: input.byteViewMode,
      },
    },
    where: {
      id: spaceId,
    },
  });

  revalidateTag(SpaceTags.GET_SPACE.toString());

  const spaceWithIntegrations = (await getSpaceWithIntegrations(spaceId)) as SpaceWithIntegrationsDto;
  return NextResponse.json(spaceWithIntegrations, { status: 200 });
}

export const PUT = withErrorHandlingV1<SpaceWithIntegrationsDto>(putHandler);
