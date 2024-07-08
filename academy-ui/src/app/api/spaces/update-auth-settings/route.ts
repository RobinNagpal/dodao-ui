import { MutationUpdateAuthSettingsArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { spaceId, input } = (await req.json()) as MutationUpdateAuthSettingsArgs;

  const spaceById = await getSpaceById(spaceId);

  checkEditSpacePermission(spaceById, req);

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
