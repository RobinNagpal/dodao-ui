import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(req: Request, { params: { id } }: { params: { id: string } }) {
  const space = await prisma.baseSpace.findFirstOrThrow({
    where: { id },
  });

  return NextResponse.json({ space }, { status: 200 });
}
