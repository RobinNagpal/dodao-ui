import { MutationUpdateSocialSettingsArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { SocialSettingsDto } from '@/types/space/SpaceDto';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const { spaceId, input } = (await req.json()) as { spaceId: string; input: SocialSettingsDto };
  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  const space = await prisma.space.update({
    data: {
      socialSettings: {
        linkedSharePdfBackgroundImage: input.linkedSharePdfBackgroundImage,
      },
    },
    where: {
      id: spaceId,
    },
  });

  return NextResponse.json({ space }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
