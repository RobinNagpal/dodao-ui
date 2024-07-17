import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  const { programId, rubrics } = await req.json();
  try {
    const existingRubricMappings = await prisma.programRubricMapping.findMany({
      where: { programId },
      select: { rubricId: true },
    });

    const existingRubricIdList = existingRubricMappings.map((mapping) => mapping.rubricId);

    if (existingRubricIdList.length > 0) {
      await prisma.rubricCell.deleteMany({
        where: {
          rubricId: { in: existingRubricIdList },
        },
      });

      await prisma.rubricLevel.deleteMany({
        where: {
          rubricId: { in: existingRubricIdList },
        },
      });

      await prisma.rubricCriteria.deleteMany({
        where: {
          rubricId: { in: existingRubricIdList },
        },
      });

      await prisma.programRubricMapping.deleteMany({
        where: {
          programId,
        },
      });

      await prisma.rubric.deleteMany({
        where: {
          id: { in: existingRubricIdList },
        },
      });
    }

    for (const rubric of rubrics) {
      const { name, summary, description, levels, criteria } = rubric;

      const newRubric = await prisma.rubric.create({
        data: {
          name,
          summary,
          description,
        },
      });

      await prisma.programRubricMapping.create({
        data: {
          programId,
          rubricId: newRubric.id,
        },
      });

      const levelIds: { [key: string]: string } = {};
      for (const level of levels) {
        const newLevel = await prisma.rubricLevel.create({
          data: {
            rubricId: newRubric.id,
            columnName: level.columnName,
            description: level.description,
            score: level.score,
          },
        });
        levelIds[level.columnName] = newLevel.id;
      }

      const newCriteria = await prisma.rubricCriteria.create({
        data: {
          rubricId: newRubric.id,
          title: criteria,
        },
      });

      for (const level of levels) {
        await prisma.rubricCell.create({
          data: {
            rubricId: newRubric.id,
            description: level.description,
            levelId: levelIds[level.columnName],
            criteriaId: newCriteria.id,
          },
        });
      }
    }

    return NextResponse.json({ status: 200, body: rubrics });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}

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
