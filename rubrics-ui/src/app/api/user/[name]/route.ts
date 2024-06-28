import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(req: Request, { params: { name } }: { params: { name: string } }) {
  const user = await prisma.user.findFirstOrThrow({
    where: { username: name },
  });

  return NextResponse.json({ user }, { status: 200 });
}
