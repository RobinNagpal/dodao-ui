import { MutationUpsertShortVideoArgs, MutationDeleteShortVideoArgs } from '@/graphql/generated/generated-types';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { NextRequest, NextResponse } from 'next/server';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/prisma';

export async function GET(req: NextRequest, { params: { videoId } }: { params: { videoId: string } }) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, message: 'spaceId is required' });

  const shortVideo = await prisma.shortVideo.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      id: videoId,
    },
  });

  return NextResponse.json({ status: 200, shortVideo });
}

export async function POST(req: NextRequest, { params: { videoId } }: { params: { videoId: string } }) {
  const { spaceId, shortVideo, byteCollection } = await req.json();
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
        byteCollectionId: byteCollection.id,
        itemType: ByteCollectionItemType.ShortVideo,
      },
    });

    if (!existingMapping) {
      const mappingItem = await prisma.byteCollectionItemMappings.create({
        data: {
          id: uuidv4(),
          itemType: ByteCollectionItemType.ShortVideo,
          order: byteCollection.shorts.length + 1,
          itemId: upsertedShortVideo.id,
          ByteCollection: {
            connect: { id: byteCollection.id },
          },
        },
      });
    }

    return NextResponse.json({ status: 200, upsertedShortVideo });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function DELETE(req: NextRequest, { params: { videoId } }: { params: { videoId: string } }) {
  const { spaceId }: MutationDeleteShortVideoArgs = await req.json();
  const spaceById = await getSpaceById(spaceId);

  checkEditSpacePermission(spaceById, req);

  try {
    const archivedShortVideo = await prisma.shortVideo.update({
      where: { id: videoId },
      data: { archive: true },
    });

    return NextResponse.json({ status: 200, archivedShortVideo });
  } catch (error) {
    console.log(error);
  }
}
