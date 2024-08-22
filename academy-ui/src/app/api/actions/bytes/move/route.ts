import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';

async function postHandler(req: NextRequest) {
  const { selectedByteCollectionId, byteId, spaceId, currentByteCollectionId } = await req.json();

  const spaceById = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });
  if (!spaceById) throw new Error(`No space found: ${spaceId}`);

  await checkEditSpacePermission(spaceById, req);

  const updatedExistingByteMapping = await prisma.byteCollectionItemMappings.update({
    where: {
      byteCollectionId_itemId: {
        byteCollectionId: currentByteCollectionId,
        itemId: byteId,
      },
    },
    data: {
      byteCollectionId: selectedByteCollectionId,
    },
  });

  return NextResponse.json({ updatedExistingByteMapping }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
