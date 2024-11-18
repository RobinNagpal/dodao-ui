import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { SortByteCollectionsRequest } from '@/types/request/ByteCollectionRequests';
import { ByteCollection } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<ByteCollection[]>> {
  const { spaceId } = await params;
  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  const request: SortByteCollectionsRequest = await req.json();

  const updates = request.newByteCollectionIdAndOrder.map((collectionIdAndOrder) => {
    return prisma.byteCollection.update({
      where: {
        id: collectionIdAndOrder.byteCollectionId,
      },
      data: {
        order: collectionIdAndOrder.order,
      },
    });
  });

  await prisma.$transaction(updates);

  const byteCollections = await prisma.byteCollection.findMany({ where: { spaceId } });

  return NextResponse.json(byteCollections, { status: 200 });
}

export const POST = withErrorHandlingV1<ByteCollection[]>(postHandler);
