import { prisma } from '../src/prisma';
import { v4 as uuidv4 } from 'uuid';

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

    const allBytes = await prisma.byte.findMany({
      where: {
        spaceId,
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
          byteIds: [],
        },
      });
    }

    const byteIdToCollectionMap = new Map();

    for (const collection of byteCollections) {
      for (const byteId of collection.byteIds) {
        const byte = allBytes.find((b) => b.id === byteId);
        const bytePriority = byte?.priority || 50;

        await prisma.byteCollectionItemMappings.create({
          data: {
            id: uuidv4(),
            byteCollectionId: collection.id,
            itemId: byteId,
            itemType: 'Byte',
            order: bytePriority,
          },
        });
        byteIdToCollectionMap.set(byteId, collection.id);
      }
    }

    for (const byte of allBytes) {
      if (!byteIdToCollectionMap.has(byte.id)) {
        await prisma.byteCollectionItemMappings.create({
          data: {
            id: uuidv4(),
            byteCollectionId: ungroupedCollection.id,
            itemId: byte.id,
            itemType: 'Byte',
            order: byte.priority,
          },
        });

        const updatedUngroupedCollection = await prisma.byteCollection.findUnique({
          where: { id: ungroupedCollection.id },
          select: { byteIds: true },
        });

        if (updatedUngroupedCollection && !updatedUngroupedCollection.byteIds.includes(byte.id)) {
          await prisma.byteCollection.update({
            where: { id: ungroupedCollection.id },
            data: {
              byteIds: {
                set: [...updatedUngroupedCollection.byteIds, byte.id],
              },
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error assigning byte collections:', error);
  }
}

assignByteCollections('test-academy-eth');
