import { prisma } from '@/prisma';

async function assignByteCollections(spaceId: string) {
  try {
    const byteCollections = await prisma.byteCollection.findMany({
      where: {
        spaceId,
        status: {
          not: 'DELETED',
        },
      },
      orderBy: {
        priority: 'desc',
      },
    });

    const bytes = await prisma.byte.findMany({
      where: { spaceId },
      orderBy: { priority: 'desc' },
    });

    let ungroupedCollection = byteCollections.find((collection) => collection.name === 'UNGROUPED_TIDBITS');
    if (!ungroupedCollection) {
      ungroupedCollection = await prisma.byteCollection.create({
        data: {
          id: 'UNGROUPED_TIDBITS',
          name: 'UNGROUPED_TIDBITS',
          spaceId: spaceId,
          description: '',
          status: 'ACTIVE',
        },
      });
    }

    for (const byte of bytes) {
      const collections = byteCollections.filter((collection) => collection.byteIds.includes(byte.id));
      if (collections.length === 0) {
        await prisma.byteCollection.update({
          where: { id: ungroupedCollection.id },
          data: { byteIds: { push: byte.id } },
        });
      }

      await prisma.byte.update({
        where: { id: byte.id },
        data: { byteCollectionId: collections.length > 0 ? collections[0].id : ungroupedCollection.id },
      });
    }
  } catch (error) {
    console.error('Error assigning byte collections:', error);
  }
}

assignByteCollections('test-academy-eth');
