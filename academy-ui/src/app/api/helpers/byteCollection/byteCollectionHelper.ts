import { ByteCollection as ByteCollectionGraphql, ByteCollectionByte, ByteCollectionDemo, ByteCollectionShort } from '@/graphql/generated/generated-types';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { getByte } from '@/app/api/helpers/byte/getByte';
import { getDemo } from '@/app/api/helpers/clickableDemo/getDemo';
import { getShort } from '@/app/api/helpers/shortVideo/getShort';
import { prisma } from '@/prisma';
import { Byte, ClickableDemos, ByteCollection, ShortVideo } from '@prisma/client';

export async function getByteCollectionWithItem(byteCollection: ByteCollection): Promise<ByteCollectionGraphql> {
  const bytes: ByteCollectionByte[] = [];
  const demos: ByteCollectionDemo[] = [];
  const shorts: ByteCollectionShort[] = [];

  const allByteCollectionItemsBytes = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: ByteCollectionItemType.Byte,
    },
    orderBy: {
      order: 'desc',
    },
  });

  const allByteCollectionItemsDemos = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: ByteCollectionItemType.ClickableDemo,
    },
    orderBy: {
      order: 'desc',
    },
  });

  const allByteCollectionItemsShorts = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: ByteCollectionItemType.ShortVideo,
    },
    orderBy: {
      order: 'desc',
    },
  });

  for (const item of allByteCollectionItemsBytes) {
    const byte = (await getByte(byteCollection.spaceId, item.itemId)) as Byte;
    bytes.push({
      byteId: byte.id,
      name: byte.name,
      content: byte.content,
      videoUrl: byte.videoUrl,
    });
  }

  for (const item of allByteCollectionItemsDemos) {
    const demo = (await getDemo(byteCollection.spaceId, item.itemId)) as ClickableDemos;
    demos.push({
      demoId: demo.id,
      title: demo.title,
      excerpt: demo.excerpt,
      steps: demo.steps,
    });
  }

  for (const item of allByteCollectionItemsShorts) {
    const short = (await getShort(byteCollection.spaceId, item.itemId)) as ShortVideo;
    shorts.push({
      shortId: short.id,
      title: short.title,
      description: short.description,
      videoUrl: short.videoUrl,
    });
  }

  return {
    ...byteCollection,
    bytes: bytes,
    demos: demos,
    shorts: shorts,
  };
}
