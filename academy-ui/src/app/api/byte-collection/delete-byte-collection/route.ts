import { MutationDeleteByteCollectionArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const args: MutationDeleteByteCollectionArgs = await req.json();
  const byteCollection = await prisma.byteCollection.findUniqueOrThrow({
    where: {
      id: args.byteCollectionId,
    },
  });

  const spaceById = await getSpaceById(byteCollection.spaceId);

  await checkEditSpacePermission(spaceById, req);

  const updatedByteCollection = await prisma.byteCollection.update({
    where: {
      id: args.byteCollectionId,
    },
    data: {
      status: 'DELETED',
    },
  });

  return NextResponse.json({ status: 200, byteCollection: updatedByteCollection });
}