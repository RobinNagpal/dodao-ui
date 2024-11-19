import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { MoveByteCollectionItemRequest } from '@/types/request/ByteCollectionRequests';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';

async function putHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<ByteCollectionSummary>> {
  const args: MoveByteCollectionItemRequest = await req.json();
  const { spaceId } = await params;
  const spaceById = await getSpaceById(spaceId);

  await checkEditSpacePermission(spaceById, req);

  await prisma.byteCollectionItemMappings.updateMany({
    where: {
      itemId: args.itemId,
      byteCollectionId: args.sourceByteCollectionId,
      itemType: args.itemType,
    },
    data: {
      byteCollectionId: args.targetByteCollectionId,
    },
  });

  const byteCollection = await prisma.byteCollection.findUniqueOrThrow({ where: { id: args.targetByteCollectionId } });
  const byteCollectionSummary = await getByteCollectionWithItem(byteCollection);

  revalidateTag(TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString());
  return NextResponse.json(byteCollectionSummary, { status: 200 });
}

export const PUT = withErrorHandlingV1<ByteCollectionSummary>(putHandler);
