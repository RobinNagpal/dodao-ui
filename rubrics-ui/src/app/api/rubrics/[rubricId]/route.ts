import { prisma } from '@/prisma';
import { Rubric } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { rubricId: string } }): Promise<NextResponse<Rubric | { error: string }>> {
  const rubricId = params.rubricId;
  const url = new URL(req.url);
  const spaceId = url.searchParams.get('spaceId');

  if (!rubricId) {
    return NextResponse.json({ error: 'Missing rubricId' }, { status: 400 });
  }

  try {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: {
        levels: {
          orderBy: {
            score: 'desc',
          },
        },
        criterias: {
          where: { isArchived: false },
        },
        cells: {
          where: { isArchived: false },
        },
        programs: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!rubric) {
      return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
    }

    return NextResponse.json(rubric);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
export async function PUT(request: Request, { params }: { params: { rubricId: string } }) {
  try {
    const { rubricId } = params;
    const { name, summary, description, spaceId } = await request.json();

    if (!rubricId || !name || !summary || !spaceId) {
      return NextResponse.json({ error: 'Rubric ID, name, and summary,spaceId are required' }, { status: 400 });
    }

    const updatedRubric = await prisma.rubric.update({
      where: { id: rubricId },
      data: {
        name: name,
        summary: summary,
        description: description,
        spaceId: spaceId,
      },
    });

    return NextResponse.json({ body: updatedRubric }, { status: 200 });
  } catch (error) {
    console.error('Error updating rubric:', error);
    return NextResponse.json({ error: 'Failed to update rubric' }, { status: 500 });
  }
}
