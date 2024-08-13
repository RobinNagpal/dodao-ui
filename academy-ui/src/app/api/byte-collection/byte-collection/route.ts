export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getByteCollectionWithItem } from '@/app/api/helpers/byteCollection/byteCollectionHelper';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const byteCollectionId = searchParams.get('byteCollectionId');
  if (!byteCollectionId) return NextResponse.json({ body: 'No byteCollectionId provided' }, { status: 400 });

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

  const byteCollection = await prisma.byteCollection.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      id: byteCollectionId,
    },
    orderBy: {
      priority: 'desc',
    },
  });

  return NextResponse.json({ byteCollection: await getByteCollectionWithItem(byteCollection) }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
