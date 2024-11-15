import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { validateSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { prisma } from '@/prisma';
import { PutByteItemRequest } from '@/types/request/ByteRequests';
import { PutByteItemResponse } from '@/types/response/ByteResponses';
import { ErrorResponse } from '@/types/response/ErrorResponse';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

async function putHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; byteCollectionId: string; byteId: string }> }
): Promise<NextResponse<PutByteItemResponse | ErrorResponse>> {
  const args: PutByteItemRequest = await req.json();

  const { byteCollectionId } = await params;

  await validateSuperAdmin(req);

  await prisma.byteCollectionItemMappings.updateMany({
    where: {
      itemId: args.itemId,
      itemType: args.itemType,
      byteCollectionId: byteCollectionId,
    },
    data: {
      archive: args.archive,
    },
  });

  if (args.itemType === ByteCollectionItemType.Byte) {
    const updatedByte = await prisma.byte.update({
      where: {
        id: args.itemId,
      },
      data: {
        archive: args.archive,
      },
    });
    return NextResponse.json({ updated: updatedByte }, { status: 200 });
  } else if (args.itemType === ByteCollectionItemType.ClickableDemo) {
    const updatedDemo = await prisma.clickableDemos.update({
      where: {
        id: args.itemId,
      },
      data: {
        archive: args.archive,
      },
    });
    return NextResponse.json({ updated: updatedDemo }, { status: 200 });
  } else if (args.itemType === ByteCollectionItemType.ShortVideo) {
    const updatedVideo = await prisma.shortVideo.update({
      where: {
        id: args.itemId,
      },
      data: {
        archive: args.archive,
      },
    });
    revalidateTag(TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString());
    return NextResponse.json({ updated: updatedVideo }, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid itemType' }, { status: 200 });
}

export const PUT = withErrorHandlingV1<PutByteItemResponse | ErrorResponse>(putHandler);
