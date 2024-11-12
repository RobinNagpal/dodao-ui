import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const user = await prisma.rubricUser.findFirstOrThrow({
    where: { username: name },
  });

  return NextResponse.json({ user }, { status: 200 });
}
