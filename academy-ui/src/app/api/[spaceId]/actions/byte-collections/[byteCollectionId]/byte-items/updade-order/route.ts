import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { UpdateByteCollectionItemsOrderRequest } from '@/types/request/ByteCollectionRequests';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(
  req: NextRequest,
  { params }: { params: { byteCollectionId: string; spaceId: string } }
): Promise<NextResponse<ByteCollectionSummary>> {
  console.log('got request to create signed url for html capture', params);
  const { byteCollectionId } = params;
  const spaceById = await getSpaceById(params.spaceId);

  await checkEditSpacePermission(spaceById, req);

  const request: UpdateByteCollectionItemsOrderRequest = await req.json();

  const updates = request.newItemIdAndOrders.map((itemIdAndOrder) => {
    return prisma.byteCollectionItemMappings.updateMany({
      where: {
        itemId: itemIdAndOrder.itemId,
        itemType: itemIdAndOrder.itemType,
        byteCollectionId,
      },
      data: {
        order: itemIdAndOrder.order,
      },
    });
  });

  await prisma.$transaction(updates);

  const byteCollection = await prisma.byteCollection.findUniqueOrThrow({ where: { id: byteCollectionId } });
  const byteCollectionSummary = await getByteCollectionWithItem(byteCollection);

  return NextResponse.json(byteCollectionSummary, { status: 200 });
}

export const POST = withErrorHandlingV1<ByteCollectionSummary>(postHandler);