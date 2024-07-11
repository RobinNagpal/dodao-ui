import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface RubricLevel {
  id?: number;
  columnName: string;
  description?: string;
  score?: number;
}

interface RubricCriteria {
  id?: number;
  title: string;
  description?: string;
}

interface RubricCell {
  id?: number;
  levelId?: number | null;
  criteriaId?: number | null;
  description: string;
}

interface Rubric {
  id?: number;
  name: string;
  summary?: string;
  description?: string;
  levels: RubricLevel[];
  criteria: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const { programId, rubrics } = await req.json();
  console.log(programId, rubrics);
  const parsedProgramId = parseInt(programId, 10);
  try {
    await prisma.rubricCell.deleteMany({
      where: {
        rubric: {
          programId: parsedProgramId,
        },
      },
    });

    await prisma.rubricLevel.deleteMany({
      where: {
        rubric: {
          programId: parsedProgramId,
        },
      },
    });

    await prisma.rubricCriteria.deleteMany({
      where: {
        rubric: {
          programId: parsedProgramId,
        },
      },
    });

    await prisma.rubric.deleteMany({
      where: {
        programId: parsedProgramId,
      },
    });

    for (const rubric of rubrics) {
      const { name, summary, description, levels, criteria } = rubric;

      const newRubric = await prisma.rubric.upsert({
        where: { programId_name: { programId: parsedProgramId, name } },
        update: {
          summary: summary || '',
          description: description || '',
        },
        create: {
          name: name,
          summary: summary || '',
          description: description || '',
          programId: parsedProgramId,
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
            description: level.description || '',
            score: level.score || 0,
          },
          create: {
            rubricId: newRubric.id,
            columnName: level.columnName,
            description: level.description || '',
            score: level.score || 0,
          },
        });
        levelIds[level.columnName] = upsertedLevel.id;
      }

      // Upsert criteria for the rubric
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

      // Upsert cells for the rubric
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
            description: level.description || '',
          },
          create: {
            rubricId: newRubric.id,
            description: level.description || '',
            levelId: levelIds[level.columnName] || null,
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
