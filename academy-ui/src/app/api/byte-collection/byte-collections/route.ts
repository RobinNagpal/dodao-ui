import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { ByteCollection as ByteCollectionGraphql } from '@/graphql/generated/generated-types';
import { getByteCollectionWithItems } from '@/app/api/helpers/byteCollection/byteCollectionHelper';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });

  const byteCollections = await prisma.byteCollection.findMany({
    where: {
      spaceId: spaceId,
      status: {
        not: 'DELETED',
      },
    },
    orderBy: {
      priority: 'desc',
    },
  });

  const byteCollectionsWithBytes: ByteCollectionGraphql[] = [];

  for (const byteCollection of byteCollections) {
    byteCollectionsWithBytes.push(await getByteCollectionWithItems(byteCollection));
  }

  return NextResponse.json({ status: 200, byteCollections: byteCollectionsWithBytes });
}
