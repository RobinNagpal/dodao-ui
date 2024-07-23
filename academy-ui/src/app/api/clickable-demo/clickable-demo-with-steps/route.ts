import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const demoId = searchParams.get('demoId');

  if (!demoId) return NextResponse.json({ status: 400, message: 'Demo ID is required' });
  const clickableDemoWithSteps = await prisma.clickableDemos.findUniqueOrThrow({
    where: {
      id: demoId,
    },
  });

  return NextResponse.json({ status: 200, clickableDemoWithSteps });
}
