import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  const { programId, rubrics } = await req.json();
  try {
    await prisma.rubricCell.deleteMany({
      where: {
        rubric: {
          programId: programId,
        },
      },
    });

    await prisma.rubricLevel.deleteMany({
      where: {
        rubric: {
          programId: programId,
        },
      },
    });

    await prisma.rubricCriteria.deleteMany({
      where: {
        rubric: {
          programId: programId,
        },
      },
    });

    await prisma.rubric.deleteMany({
      where: {
        programId: programId,
      },
    });

    for (const rubric of rubrics) {
      const { name, summary, description, levels, criteria } = rubric;

      const newRubric = await prisma.rubric.upsert({
        where: { programId_name: { programId: programId, name } },
        update: {
          summary: summary,
          description: description,
        },
        create: {
          name: name,
          summary: summary,
          description: description,
          programId: programId,
        },
      });

      const levelIds: { [key: string]: number } = {};
      for (const level of levels) {
        const upsertedLevel = await prisma.rubricLevel.upsert({
          where: {
            rubricId_columnName: {
              rubricId: newRubric.id,
              columnName: level.columnName,
            },
          },
          update: {
            description: level.description,
            score: level.score,
          },
          create: {
            rubricId: newRubric.id,
            columnName: level.columnName,
            description: level.description,
            score: level.score,
          },
        });
        levelIds[level.columnName] = upsertedLevel.id;
      }

      const newCriteria = await prisma.rubricCriteria.upsert({
        where: {
          rubricId_title: {
            rubricId: newRubric.id,
            title: criteria,
          },
        },
        update: {
          title: criteria,
        },
        create: {
          rubricId: newRubric.id,
          title: criteria,
        },
      });

      for (const level of levels) {
        await prisma.rubricCell.upsert({
          where: {
            rubricId_levelId_criteriaId: {
              rubricId: newRubric.id,
              levelId: levelIds[level.columnName],
              criteriaId: newCriteria.id,
            },
          },
          update: {
            description: level.description,
          },
          create: {
            rubricId: newRubric.id,
            description: level.description,
            levelId: levelIds[level.columnName],
            criteriaId: newCriteria.id,
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
