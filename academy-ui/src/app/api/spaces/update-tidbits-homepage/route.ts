import { MutationUpdateTidbitsHomepageArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { spaceId, tidbitsHomepage } = (await req.json()) as MutationUpdateTidbitsHomepageArgs;
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  const space = await prisma.space.update({
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

  return NextResponse.json({ space }, { status: 200 });
}
