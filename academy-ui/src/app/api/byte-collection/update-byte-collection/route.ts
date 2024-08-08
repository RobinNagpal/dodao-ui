import { MutationUpdateByteCollectionArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const args: MutationUpdateByteCollectionArgs = await req.json();
  const byteCollection = await prisma.byteCollection.findUniqueOrThrow({
    where: {
      id: args.input.byteCollectionId,
    },
  });

  const spaceById = await getSpaceById(byteCollection.spaceId);

  await checkEditSpacePermission(spaceById, req);

  const updatedByteCollection = await prisma.byteCollection.update({
    where: {
      id: args.input.byteCollectionId,
    },
    data: {
      name: args.input.name,
      description: args.input.description,
      byteIds: args.input.byteIds,
      status: args.input.status,
      updatedAt: new Date(),
      priority: args.input.priority,
      videoUrl: args.input.videoUrl,
    },
  });

  const byteCollectionsWithBytes = await getByteCollectionWithItem(updatedByteCollection);

  return NextResponse.json({ byteCollection: byteCollectionsWithBytes }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
