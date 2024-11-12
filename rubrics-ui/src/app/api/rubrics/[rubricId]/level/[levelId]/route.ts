import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
export async function PUT(request: Request, { params }: { params: Promise<{ rubricId: string; levelId: string }> }) {
  const { rubricId, levelId } = await params;
  const { columnName, score, description } = await request.json();

  try {
    const updatedRubricLevel = await prisma.rubricLevel.upsert({
      where: {
        id: levelId,
      },
      update: {
        columnName,
        score,
        description,
      },
      create: {
        id: levelId,
        rubricId,
        columnName,
        score,
        description,
        isArchived: false,
      },
    });

    return NextResponse.json(updatedRubricLevel);
  } catch (error) {
    console.error('Failed to upsert rubric level', error);
    return NextResponse.json({ error: 'Failed to upsert rubric level' }, { status: 500 });
  }
}
