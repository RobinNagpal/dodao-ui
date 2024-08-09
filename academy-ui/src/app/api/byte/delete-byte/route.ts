import { MutationDeleteByteArgs } from '@/graphql/generated/generated-types';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
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

export const POST = withErrorHandling(postHandler);
