import { prisma } from '@/prisma';
import { v4 } from 'uuid';

async function assignByteCollections(spaceId: string) {
  try {
    const byteCollections = await prisma.byteCollection.findMany({
      where: {
        spaceId,
      },
      orderBy: {
        priority: 'desc',
      },
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

    for (const collection of byteCollections) {
      collection.byteIds.forEach(async (byteId, index) => {
        await prisma.byteCollectionItemMappings.create({
          data: {
            id: v4(),
            byteCollectionId: collection.id,
            itemId: byteId,
            itemType: 'Byte',
            order: index,
          },
        });
      });
    }
  } catch (error) {
    console.error('Error assigning byte collections:', error);
  }
}

assignByteCollections('test-academy-eth');
