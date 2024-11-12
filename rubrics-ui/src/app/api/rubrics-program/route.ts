import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const spaceId = req.nextUrl.searchParams.get('spaceId');
  if (!spaceId) {
    return NextResponse.json({ error: "Missing 'spaceId' query parameter" }, { status: 400 });
  }

  try {
    const rubrics = await prisma.rubric.findMany({
      where: {
        spaceId: spaceId,
      },
      select: {
        id: true,
        name: true,
        summary: true,
      },
    });

    return NextResponse.json({ status: 200, body: rubrics });
  } catch (error) {
    console.error('Error getting Rubrics:', error);
    return NextResponse.json({ status: 500, body: 'Failed to get Rubrics' });
  }
}
