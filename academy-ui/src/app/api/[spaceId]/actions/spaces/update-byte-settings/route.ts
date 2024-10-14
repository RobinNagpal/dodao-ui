import { MutationUpdateByteSettingsArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { SpaceTags } from '@/utils/api/fetchTags';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const { spaceId, input } = (await req.json()) as MutationUpdateByteSettingsArgs;
  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  const space = await prisma.space.update({
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

  return NextResponse.json({ space }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
