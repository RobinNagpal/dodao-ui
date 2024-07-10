import { MutationUpdateSocialSettingsArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { spaceId, input } = (await req.json()) as MutationUpdateSocialSettingsArgs;
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

  return NextResponse.json({ status: 200, space });
}
