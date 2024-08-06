import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  const { programId, rubric } = await req.json();
  try {
    const previousRubrics = await prisma.rubric.findMany({
      where: {
        programs: {
          some: {
            programId: programId,
          },
        },
      },
    });

    for (const previousRubric of previousRubrics) {
      const rubricId = previousRubric.id;

      await prisma.rubricCell.deleteMany({ where: { rubricId } });
      await prisma.rubricLevel.deleteMany({ where: { rubricId } });
      await prisma.rubricCriteria.deleteMany({ where: { rubricId } });
    }

    await prisma.programRubricMapping.deleteMany({
      where: {
        programId: programId,
      },
    });

    await prisma.rubric.deleteMany({
      where: {
        id: {
          in: previousRubrics.map((rubric) => rubric.id),
        },
      },
    });

    const newRubric = await prisma.rubric.create({
      data: {
        name: rubric[0].name,
        summary: rubric[0].summary,
        description: rubric[0].description,
        programs: {
          create: { programId },
        },
      },
    });

    const levelIds: { [key: string]: string } = {};
    for (const level of rubric[0].levels) {
      const newLevel = await prisma.rubricLevel.create({
        data: {
          columnName: level.columnName,
          description: level.description,
          score: level.score,
          rubricId: newRubric.id,
        },
      });
      levelIds[level.columnName] = newLevel.id;
    }

    for (const subRubric of rubric) {
      const { criteria, levels } = subRubric;

      const newCriteria = await prisma.rubricCriteria.create({
        data: {
          title: criteria,
          rubricId: newRubric.id,
        },
      });

      for (const level of levels) {
        await prisma.rubricCell.create({
          data: {
            description: level.description,
            levelId: levelIds[level.columnName],
            criteriaId: newCriteria.id,
            rubricId: newRubric.id,
          },
        });
      }
    }

    return NextResponse.json({ status: 200, body: rubric });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rubricId = url.searchParams.get('rubricId');

  if (!rubricId) {
    return NextResponse.json({ status: 400, body: 'Missing rubricId' });
  }

  try {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: {
        levels: true,
        criteria: true,
        RubricCell: true,
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
    }));

    const programDetails = rubric.programs.map((mapping) => ({
      name: mapping.program.name,
      summary: mapping.program.summary,
    }));

    const formattedRubric = {
      name: rubric.name,
      rubricId: rubricId,
      criteriaOrder: rubric.criteria.map((criteria) => criteria.title ?? '').filter((title) => title !== ''),
      rubric: criteriaMap,
      ratingHeaders: ratingHeadersWithScores,
      programs: programDetails,
    };

    return NextResponse.json({ status: 200, body: formattedRubric });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}
