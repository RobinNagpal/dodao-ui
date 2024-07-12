import { prisma } from '@/prisma';
import { Byte } from '@prisma/client';

export async function getByte(spaceId: string, byteId: string): Promise<Byte | undefined> {
  let byte = await prisma.byte.findUnique({
    where: {
      id: byteId,
    },
  });

  // If byte is still not found, throw an error or handle it appropriately
  if (!byte) {
    throw new Error('Byte not found');
  }
  return byte;
}
