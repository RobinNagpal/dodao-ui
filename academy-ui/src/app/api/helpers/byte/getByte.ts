import { prisma } from '@/prisma';
import { Byte } from '@prisma/client';
import { NextRequest } from 'next/server';

export async function getByte(spaceId: string, byteId: string): Promise<Byte | undefined> {
  let byte = await prisma.byte.findUnique({
    where: {
      id: byteId,
    },
  });

  if (!byte) {
    throw new Error('Byte not found');
  }

  return byte;
}
