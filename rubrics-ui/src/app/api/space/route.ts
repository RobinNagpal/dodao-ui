import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(req: Request) {
  const { domain } = await req.json();

  const space = await prisma.space.findFirst({
    where: {
      domains: {
        has: domain,
      },
    },
  });

  if (space) {
    return NextResponse.json({ space }, { status: 200 });
  }

  if (domain === 'localhost') {
    const space = await prisma.space.findFirst({
      where: {
        id: 'test-academy-eth',
      },
    });

    return NextResponse.json({ space }, { status: 200 });
  }

  return NextResponse.json({ space: null }, { status: 200 });
}
