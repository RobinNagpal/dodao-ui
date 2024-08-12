import { MutationUpsertShortVideoArgs, MutationDeleteShortVideoArgs } from '@/graphql/generated/generated-types';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { NextRequest, NextResponse } from 'next/server';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/prisma';

async function getHandler(req: NextRequest, { params: { videoId } }: { params: { videoId: string } }) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ message: 'spaceId is required' }, { status: 400 });

  const shortVideo = await prisma.shortVideo.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      id: videoId,
    },
  });

  return NextResponse.json({ shortVideo }, { status: 200 });
}

async function postHandler(req: NextRequest, { params: { videoId } }: { params: { videoId: string } }) {
  const { spaceId, shortVideo, byteCollectionId } = await req.json();
  try {
    const spaceById = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });
    if (!spaceById) throw new Error(`No space found: ${spaceId}`);

    await checkEditSpacePermission(spaceById, req);

    const upsertedShortVideo = await prisma.shortVideo.upsert({
      create: {
        id: videoId,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: shortVideo.title,
        description: shortVideo.description,
        priority: shortVideo.priority,
        spaceId: spaceId,
        videoUrl: shortVideo.videoUrl,
        thumbnail: shortVideo.thumbnail,
      },
      update: {
        title: shortVideo.title,
        description: shortVideo.description,
        priority: shortVideo.priority,
        updatedAt: new Date(),
        videoUrl: shortVideo.videoUrl,
        thumbnail: shortVideo.thumbnail,
      },
      where: {
        id: videoId,
      },
    });

    const existingMapping = await prisma.byteCollectionItemMappings.findFirst({
      where: {
        itemId: upsertedShortVideo.id,
        byteCollectionId,
        itemType: ByteCollectionItemType.ShortVideo,
      },
    });

    if (!existingMapping) {
      const byteCollection = await prisma.byteCollection.findUnique({
        where: {
          id: byteCollectionId,
        },
        select: {
          items: true,
        },
      });
      const items = byteCollection?.items;
      let highestOrderNumber = 0;
      if (items && items?.length > 0) {
        const orderNumbers = items.map((item) => item.order);
        highestOrderNumber = orderNumbers.length > 0 ? Math.max(...orderNumbers) : 0;
      }
      await prisma.byteCollectionItemMappings.create({
        data: {
          id: uuidv4(),
          itemType: ByteCollectionItemType.ShortVideo,
          order: highestOrderNumber + 1,
          itemId: upsertedShortVideo.id,
          ByteCollection: {
            connect: { id: byteCollectionId },
          },
        },
      });
    }
    return NextResponse.json({ upsertedShortVideo }, { status: 200 });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function deleteHandler(req: NextRequest, { params: { videoId } }: { params: { videoId: string } }) {
  const { spaceId }: MutationDeleteShortVideoArgs = await req.json();
  const spaceById = await getSpaceById(spaceId);

  checkEditSpacePermission(spaceById, req);

  try {
    const archivedShortVideo = await prisma.shortVideo.update({
      where: { id: videoId },
      data: { archive: true },
    });

    await prisma.byteCollectionItemMappings.updateMany({
      where: {
        itemId: videoId,
      },
      data: {
        archive: true,
      },
    });

    return NextResponse.json({ status: 200, archivedShortVideo });
  } catch (error) {
    console.log(error);
  }
}

export const GET = withErrorHandling(getHandler);
export const POST = withErrorHandling(postHandler);
export const DELETE = withErrorHandling(deleteHandler);
