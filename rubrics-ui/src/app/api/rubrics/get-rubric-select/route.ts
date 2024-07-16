import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const rubrics = await prisma.rubric.findMany({
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
