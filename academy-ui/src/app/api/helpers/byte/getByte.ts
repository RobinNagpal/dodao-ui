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

  let completed: boolean = false;

  try {
    let response = await prisma.byteSubmission.findUnique({
      where: {
        id: byteId,
      },
    });
    if (response) {
      completed = true;
      return byte;
    } else {
      return byte;
    }
  } catch (e) {
    throw new Error('Byte submission cannot be confirmed');
  }
}
