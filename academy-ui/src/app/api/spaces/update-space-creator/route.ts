import { MutationUpdateSpaceCreatorArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const { spaceId, creator } = (await req.json()) as MutationUpdateSpaceCreatorArgs;
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);
  const space = await prisma.space.update({
    data: {
      creator: creator,
    },
    where: {
      id: spaceId,
    },
  });

  return NextResponse.json({ space }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
