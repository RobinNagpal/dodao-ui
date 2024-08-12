import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { getByte } from '@/app/api/helpers/byte/getByte';
import { getDemo } from '@/app/api/helpers/clickableDemo/getDemo';
import { getShort } from '@/app/api/helpers/shortVideo/getShort';
import { prisma } from '@/prisma';
import { Byte, ClickableDemos, ByteCollection, ShortVideo } from '@prisma/client';
import { ByteCollectionItem, ByteCollectionSummary } from '@/types/byteCollections/byteCollection';

export async function getByteCollectionWithItem(byteCollection: ByteCollection): Promise<ByteCollectionSummary> {
  const items: ByteCollectionItem[] = [];

  const allByteCollectionItemsBytes = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: ByteCollectionItemType.Byte,
    },
  });

  const allByteCollectionItemsDemos = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: ByteCollectionItemType.ClickableDemo,
    },
  });

  const allByteCollectionItemsShorts = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: ByteCollectionItemType.ShortVideo,
    },
  });

  for (const item of allByteCollectionItemsBytes) {
    const byte = (await getByte(byteCollection.spaceId, item.itemId)) as Byte;
    items.push({
      byte: {
        byteId: byte.id,
        name: byte.name,
        content: byte.content,
        videoUrl: byte.videoUrl,
        archive: byte.archive ?? false,
      },
      type: ByteCollectionItemType.Byte,
      order: item.order,
    });
  }

  for (const item of allByteCollectionItemsDemos) {
    const demo = (await getDemo(byteCollection.spaceId, item.itemId)) as ClickableDemos;
    items.push({
      demo: {
        demoId: demo.id,
        title: demo.title,
        excerpt: demo.excerpt,
        archive: demo.archive ?? false,
      },
      type: ByteCollectionItemType.ClickableDemo,
      order: item.order,
    });
  }

  for (const item of allByteCollectionItemsShorts) {
    const short = (await getShort(byteCollection.spaceId, item.itemId)) as ShortVideo;
    items.push({
      short: {
        shortId: short.id,
        title: short.title,
        description: short.description,
        videoUrl: short.videoUrl,
        archive: short.archive ?? false,
      },
      type: ByteCollectionItemType.ShortVideo,
      order: item.order,
    });
  }

  items.sort((a, b) => a.order - b.order);

  return {
    ...byteCollection,
    items,
  };
}
