import { prisma } from '@/prisma';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/app/api/helpers/adapters/errorLogger';

export async function POST(req: NextRequest) {
  const { byteCollectionId, itemId, itemType, order } = await req.json();

  try {
    const existingMapping = await prisma.byteCollectionItemMappings.findFirst({
      where: {
        itemId,
        byteCollectionId,
        itemType: 'Short',
      },
    });

    if (existingMapping) {
      return NextResponse.json({ status: 200, message: 'Item already exists in the mapping' });
    }

    const mappingItem = await prisma.byteCollectionItemMappings.create({
      data: {
        id: uuidv4(),
        itemType,
        order,
        itemId,
        ByteCollection: {
          connect: { id: byteCollectionId },
        },
      },
    });
    return NextResponse.json({ status: 200, mappingItem });
  } catch (e) {
    console.error('Error creating mapping:', e);
    await logError((e as any)?.response?.data || 'Error in creating Mapping', {}, e as any, null, null);
  }
}
