import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function POST(request: NextRequest) {
  const { code, userId } = await request.json();
  if (code !== '12345' || !userId) {
    return NextResponse.json({ error: 'Invalid' }, { status: 401 });
  }

  // e.g. mark lastVerifiedAt
  await prisma.user.update({
    where: { id: userId },
    data: {
      /* maybe track login timestamp */
    },
  });

  return NextResponse.json({ ok: true });
}
