import { NextRequest, NextResponse } from 'next/server';
import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const byteCollectionId = searchParams.get('byteCollectionId');
  if (!byteCollectionId) return NextResponse.json({ status: 400, body: 'No byteCollectionId provided' });

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });

  const byteCollection = await prisma.byteCollection.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      id: byteCollectionId,
    },
    orderBy: {
      priority: 'desc',
    },
  });

  return NextResponse.json({ status: 200, byteCollection: await getByteCollectionWithItem(byteCollection) });
}

export const GET = withErrorHandling(getHandler);
