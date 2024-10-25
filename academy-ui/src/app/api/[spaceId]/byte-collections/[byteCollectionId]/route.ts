import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { CreateByteCollectionRequest } from '@/types/request/ByteCollectionRequests';
import { NextRequest, NextResponse } from 'next/server';

async function putHandler(
  req: NextRequest,
  { params }: { params: { spaceId: string; byteCollectionId: string } }
): Promise<NextResponse<ByteCollectionSummary>> {
  const args: CreateByteCollectionRequest = await req.json();
  const byteCollection = await prisma.byteCollection.findUniqueOrThrow({
    where: {
      id: params.byteCollectionId,
    },
  });

  const spaceById = await getSpaceById(byteCollection.spaceId);

  await checkEditSpacePermission(spaceById, req);

  const updatedByteCollection = await prisma.byteCollection.update({
    where: {
      id: params.byteCollectionId,
    },
    data: {
      name: args.name,
      description: args.description,
      updatedAt: new Date(),
      priority: args.priority,
      videoUrl: args.videoUrl,
    },
  });

  const byteCollectionsWithBytes = await getByteCollectionWithItem(updatedByteCollection);

  return NextResponse.json(byteCollectionsWithBytes, { status: 200 });
}

export const PUT = withErrorHandlingV1<ByteCollectionSummary>(putHandler);
