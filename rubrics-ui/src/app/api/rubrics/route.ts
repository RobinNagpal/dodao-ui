import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { NewCriteriaRequest } from '@/types/rubricsTypes/types';
export async function POST(req: NextRequest, res: NextResponse) {
  const { programId, rubric, spaceId } = await req.json();

  try {
    if (!Array.isArray(rubric.levels)) {
      return NextResponse.json({ status: 400, body: 'Invalid levels data' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingRubric = await tx.rubric.findFirst({
        where: {
          programs: {
            some: {
              programId: programId,
            },
          },
        },
      });

      let rubricId = existingRubric ? existingRubric.id : null;

      if (rubricId) {
        await tx.rubric.update({
          where: { id: rubricId },
          data: {
            name: rubric.name,
            summary: rubric.summary,
            description: rubric.description,
            spaceId: spaceId,
          },
        });
      } else {
        const newRubric = await tx.rubric.create({
          data: {
            name: rubric.name,
            summary: rubric.summary,
            description: rubric.description,
            programs: {
              create: { programId },
            },
            spaceId: spaceId,
          },
        });
        rubricId = newRubric.id;
      }

      const levelIds: { [key: string]: string } = {};

      for (const level of rubric.levels) {
        if (!level.columnName || typeof level.score !== 'number') {
          return NextResponse.json({ status: 400, body: 'Invalid level data' });
        }

        const existingLevel = await tx.rubricLevel.findFirst({
          where: {
            rubricId: rubricId,
            columnName: level.columnName,
          },
        });

        if (existingLevel) {
          await tx.rubricLevel.update({
            where: { id: existingLevel.id },
            data: {
              description: level.description,
              score: level.score,
            },
          });
          levelIds[level.columnName] = existingLevel.id;
        } else {
          const newLevel = await tx.rubricLevel.create({
            data: {
              columnName: level.columnName,
              description: level.description,
              score: level.score,
              rubricId: rubricId,
            },
          });
          levelIds[level.columnName] = newLevel.id;
        }
      }

      if (!rubric.criteria) {
        return NextResponse.json({ status: 400, body: 'Missing criteria data' });
      }

      const existingCriteria = await tx.rubricCriteria.findFirst({
        where: {
          rubricId: rubricId,
          title: rubric.criteria,
        },
      });

      let criteriaId = existingCriteria ? existingCriteria.id : null;

      if (criteriaId) {
        await tx.rubricCriteria.update({
          where: { id: criteriaId },
          data: {
            title: rubric.criteria,
          },
        });
      } else {
        const newCriteria = await tx.rubricCriteria.create({
          data: {
            title: rubric.criteria,
            rubricId: rubricId,
          },
        });
        criteriaId = newCriteria.id;
      }

      for (const level of rubric.levels) {
        const existingCell = await tx.rubricCell.findFirst({
          where: {
            rubricId: rubricId,
            criteriaId: criteriaId,
            levelId: levelIds[level.columnName],
          },
        });

        if (existingCell) {
          await tx.rubricCell.update({
            where: { id: existingCell.id },
            data: {
              description: level.description,
            },
          });
        } else {
          await tx.rubricCell.create({
            data: {
              description: level.description,
              levelId: levelIds[level.columnName],
              criteriaId: criteriaId,
              rubricId: rubricId,
            },
          });
        }
      }

      const fullRubric = await tx.rubric.findUnique({
        where: { id: rubricId },
        include: {
          levels: true,
          criterias: {
            include: {
              cells: true,
            },
          },
          cells: {
            include: {
              level: true,
              criteria: true,
            },
          },
          programs: true,
        },
      });

      return fullRubric;
    });

    return NextResponse.json({ status: 200, body: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}

export async function PUT(request: Request) {
  try {
    const data: NewCriteriaRequest = await request.json();

    const existingRubric = await prisma.rubric.findUnique({
      where: { id: data.rubricId },
    });

    if (!existingRubric) {
      return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
    }

    const newCriteria = await prisma.rubricCriteria.create({
      data: {
        title: data.title,
        rubricId: data.rubricId,
      },
    });

    const cells = data.cells.map((cell) => ({
      description: cell.description,
      levelId: cell.ratingHeaderId,
      criteriaId: newCriteria.id,
      rubricId: data.rubricId,
    }));

    await prisma.rubricCell.createMany({
      data: cells,
    });

    const createdCells = await prisma.rubricCell.findMany({
      where: { criteriaId: newCriteria.id },
    });

    return NextResponse.json({ newCriteria, createdCells }, { status: 201 });
  } catch (error) {
    console.error('Error adding criteria:', error);
    return NextResponse.json({ error: 'Failed to add criteria' }, { status: 500 });
  }
}

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
