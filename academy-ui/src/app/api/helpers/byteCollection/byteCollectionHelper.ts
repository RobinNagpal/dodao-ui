import { ByteCollection as ByteCollectionGraphql, ByteCollectionByte } from '@/graphql/generated/generated-types';
import { getByte } from '@/app/api/helpers/byte/getByte';
import { Byte, ByteCollection } from '@prisma/client';

export async function getByteCollectionWithBytes(byteCollection: ByteCollection): Promise<ByteCollectionGraphql> {
  const bytes: ByteCollectionByte[] = [];
  for (const byteId of byteCollection.byteIds) {
    const byte = (await getByte(byteCollection.spaceId, byteId)) as Byte;
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
