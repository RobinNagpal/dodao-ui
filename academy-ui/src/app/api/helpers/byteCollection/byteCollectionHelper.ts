import { ByteCollection as ByteCollectionGraphql, ByteCollectionByte } from '@/graphql/generated/generated-types';
import { getByte } from '@/app/api/helpers/byte/getByte';
import { prisma } from '@/prisma';
import { Byte, ByteCollection } from '@prisma/client';

export async function getByteCollectionWithBytes(byteCollection: ByteCollection): Promise<ByteCollectionGraphql> {
  const bytes: ByteCollectionByte[] = [];

  const allByteCollectionItems = await prisma.byteCollectionItemMappings.findMany({
    where: {
      byteCollectionId: byteCollection.id,
      itemType: 'Byte',
    },
    orderBy: {
      order: 'desc',
    },
  });

  for (const item of allByteCollectionItems) {
    const byte = (await getByte(byteCollection.spaceId, item.itemId)) as Byte;
    bytes.push({
      byteId: byte.id,
      name: byte.name,
      content: byte.content,
      videoUrl: byte.videoUrl,
    });
  }
  return {
    ...byteCollection,
    bytes: bytes,
  };
}
