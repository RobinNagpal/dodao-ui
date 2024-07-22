import { MutationDeleteGuideArgs } from '@/graphql/generated/generated-types';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { spaceId, uuid }: MutationDeleteGuideArgs = await req.json();
  const spaceById = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });
  if (!spaceById) return NextResponse.json({ status: 200, body: `No space found: ${spaceId}` });

  await checkEditSpacePermission(spaceById, req);
  const guide = await prisma.guide.update({
    where: { id: uuid },
    data: {
      archive: true,
    },
  });
  return NextResponse.json({ status: 200, guide });
}
