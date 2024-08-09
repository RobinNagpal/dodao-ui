import { MutationDeleteGuideArgs } from '@/graphql/generated/generated-types';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const { spaceId, uuid }: MutationDeleteGuideArgs = await req.json();
  const spaceById = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });
  if (!spaceById) return NextResponse.json({ body: `No space found: ${spaceId}` }, { status: 400 });

  await checkEditSpacePermission(spaceById, req);
  const guide = await prisma.guide.update({
    where: { id: uuid },
    data: {
      archive: true,
    },
  });
  return NextResponse.json({ guide }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
