import { MutationUpdateAuthSettingsArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const { spaceId, input } = (await req.json()) as MutationUpdateAuthSettingsArgs;

  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  const space = await prisma.space.update({
    data: {
      authSettings: {
        enableLogin: input.enableLogin,
        loginOptions: input.loginOptions,
      },
    },
    where: {
      id: spaceId,
    },
  });
  return NextResponse.json({ status: 200, space });
}

export const POST = withErrorHandling(postHandler);
