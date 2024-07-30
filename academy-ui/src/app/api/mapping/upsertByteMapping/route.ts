import { prisma } from '@/prisma';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/app/api/helpers/adapters/errorLogger';

export async function POST(req: NextRequest) {
  const { byteCollectionId, itemId, itemType, order } = await req.json();
  try {
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
    await logError((e as any)?.response?.data || 'Error in creating Mapping', {}, e as any, null, null);
  }
}
