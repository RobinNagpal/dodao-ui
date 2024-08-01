import { ByteCollection as ByteCollectionGraphql, ByteCollectionByte, ByteCollectionDemo } from '@/graphql/generated/generated-types';
import { getByte } from '@/app/api/helpers/byte/getByte';
import { getDemo } from '@/app/api/helpers/clickableDemo/getDemo';
import { prisma } from '@/prisma';
import { Byte, ClickableDemos, ByteCollection } from '@prisma/client';

export async function getByteCollectionWithItem(byteCollection: ByteCollection): Promise<ByteCollectionGraphql> {
  const bytes: ByteCollectionByte[] = [];
  const demos: ByteCollectionDemo[] = [];

  const allByteCollectionItemsBytes = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: 'Byte',
    },
    orderBy: {
      order: 'desc',
    },
  });

  const allByteCollectionItemsDemos = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: 'Demo',
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

  return {
    ...byteCollection,
    bytes: bytes,
    demos: demos,
  };
}
