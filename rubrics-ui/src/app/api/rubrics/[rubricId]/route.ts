import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest, { params }: { params: { rubricId: string } }) {
  const rubricId = params.rubricId;
  const url = new URL(req.url);
  const spaceId = url.searchParams.get('spaceId');

  if (!rubricId) {
    return NextResponse.json({ status: 400, body: 'Missing rubricId' });
  }

  try {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: {
        levels: true,
        criteria: {
          where: { isArchived: false },
        },
        RubricCell: {
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
      return NextResponse.json({ status: 404, body: 'Rubric not found' });
    }

    if (!rubric.programs || rubric.programs.length === 0) {
      return NextResponse.json({ status: 404, body: 'No associated program found' });
    }

    const ratingHeaders = rubric.levels.map((level) => ({
      id: level.id,
      header: level.columnName,
      score: level.score,
    }));

    const sortedRatingHeaders = ratingHeaders.sort((a: any, b: any) => b.score - a.score);

    const ratingHeaderIndexMap: Record<string, number> = sortedRatingHeaders.reduce((map, header, index) => {
      map[header.id] = index;
      return map;
    }, {} as Record<string, number>);

    const criteriaMap: Record<string, Array<{ cellId: string; description: string | null }>> = rubric.criteria.reduce((acc, criteria) => {
      if (criteria.title) {
        const cellsForCriteria = rubric.RubricCell.filter((cell) => cell.criteriaId === criteria.id)
          .sort((a, b) => {
            const aIndex = ratingHeaderIndexMap[a.levelId!];
            const bIndex = ratingHeaderIndexMap[b.levelId!];
            return aIndex - bIndex;
          })
          .map((cell) => ({ cellId: cell.id, description: cell.description ?? '' }));
        acc[criteria.title] = cellsForCriteria;
      }
      return acc;
    }, {} as Record<string, Array<{ cellId: string; description: string | null }>>);

    const ratingHeadersWithScores = sortedRatingHeaders.map((header) => ({
      header: header.header,
      score: header.score,
      id: header,
    }));

    const programDetails = rubric.programs.map((mapping) => ({
      name: mapping.program.name,
      summary: mapping.program.summary,
    }));

    const formattedRubric = {
      name: rubric.name,
      summary: rubric.summary,
      details: rubric.description,
      rubricId: rubricId,
      criteriaOrder: rubric.criteria.map((criteria) => criteria.title ?? '').filter((title) => title !== ''),
      rubric: criteriaMap,
      ratingHeaders: ratingHeaders,
      programs: programDetails,
      criteriaIds: Object.fromEntries(rubric.criteria.map((criteria) => [criteria.title, criteria.id]).filter(([title, id]) => title && id)),
    };

    return NextResponse.json({ status: 200, body: formattedRubric });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
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
