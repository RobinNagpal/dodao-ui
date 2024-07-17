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

    // Create a new rubric
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

    // Create levels for the rubric
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

    return NextResponse.json({ status: 200, body: 'Rubrics submitted successfully' });
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
