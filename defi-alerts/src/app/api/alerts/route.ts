import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const alerts = await prisma.alert.findMany({
    where: { userId },
    include: {
      conditions: true,
      deliveryChannels: true,
      selectedChains: true,
      selectedAssets: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(alerts);
}
