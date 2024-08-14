import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

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

  const byteCollectionsWithBytes: ByteCollectionSummary[] = [];

  for (const byteCollection of byteCollections) {
    byteCollectionsWithBytes.push(await getByteCollectionWithItem(byteCollection));
  }

  return NextResponse.json({ byteCollections: byteCollectionsWithBytes }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
