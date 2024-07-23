import { MutationDeleteClickableDemoArgs, QueryClickableDemosArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationDeleteClickableDemoArgs = await req.json();
  const spaceById = await getSpaceById(args.spaceId);
  await checkEditSpacePermission(spaceById, req);
  const updatedClickableDemo = await prisma.clickableDemos.update({
    where: {
      id: args.demoId,
    },
    data: {
      archive: true,
    },
  });
  return NextResponse.json({ status: 200, updatedClickableDemo });
}
