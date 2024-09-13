import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { MutationDeleteItemArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function deleteHandler(req: NextRequest) {
  const args: MutationDeleteItemArgs = await req.json();
  validateSuperAdmin(req);

  await prisma.byteCollectionItemMappings.updateMany({
    where: {
      itemId: args.itemId,
    },
    data: {
      archive: true,
    },
  });

  let deleted;
  if (args.itemType === ByteCollectionItemType.Byte) {
    deleted = await prisma.byte.update({
      where: {
        id: args.itemId,
      },
      data: {
        archive: true,
      },
    });
  } else if (args.itemType === ByteCollectionItemType.ClickableDemo) {
    deleted = await prisma.clickableDemos.update({
      where: {
        id: args.itemId,
      },
      data: {
        archive: true,
      },
    });
  } else if (args.itemType === ByteCollectionItemType.ShortVideo) {
    deleted = await prisma.shortVideo.update({
      where: {
        id: args.itemId,
      },
      data: {
        archive: true,
      },
    });
  }

  return NextResponse.json({ deleted: !!deleted }, { status: 200 });
}

export const DELETE = withErrorHandling(deleteHandler);
