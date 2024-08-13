import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
//TODO api for mapping rubric and program
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const spaceId = req.nextUrl.searchParams.get('spaceId');

    if (!spaceId) {
      return NextResponse.json({ status: 400, body: 'Missing spaceId parameter' });
    }
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
