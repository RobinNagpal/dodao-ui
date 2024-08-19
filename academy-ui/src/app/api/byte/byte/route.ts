import { NextRequest, NextResponse } from 'next/server';
import { getByte } from '@/app/api/helpers/byte/getByte';
import { MutationDeleteByteArgs } from '@/graphql/generated/generated-types';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const byteId = searchParams.get('byteId');

  if (!byteId) return NextResponse.json({ body: 'No byteId provided' }, { status: 400 });

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

  return NextResponse.json({ byte: await getByte(spaceId, byteId) }, { status: 200 });
}

async function deleteHandler(req: NextRequest) {
  const args: MutationDeleteByteArgs = await req.json();
  validateSuperAdmin(req);

  const deleted = await prisma.byte.update({
    where: {
      id: args.byteId,
    },
    data: {
      archive: true,
    },
  });
  await prisma.byteCollectionItemMappings.updateMany({
    where: {
      itemId: args.byteId,
    },
    data: {
      archive: true,
    },
  });

  return NextResponse.json({ deleted: !!deleted }, { status: 200 });
}

/// Wrapping handle in withErrorHandling
export const DELETE = withErrorHandling(deleteHandler);
export const GET = withErrorHandling(getHandler);
