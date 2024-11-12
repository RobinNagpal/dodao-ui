import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = await prisma.baseSpace.findFirstOrThrow({
    where: { id },
  });

  return NextResponse.json({ space }, { status: 200 });
}
