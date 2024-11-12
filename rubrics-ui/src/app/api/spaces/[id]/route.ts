import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const space = await prisma.rubricSpace.findFirstOrThrow({
    where: { id: (await params).id },
  });

  return NextResponse.json({ space }, { status: 200 });
}
