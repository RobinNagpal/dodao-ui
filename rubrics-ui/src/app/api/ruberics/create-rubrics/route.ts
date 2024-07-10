import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RubricCell {
  columnName: string;
  description?: string;
  score: number;
}

interface RubricCriteria {
  title: string;
  description?: string;
}

interface Rubric {
  name: string;
  summary?: string;
  description?: string;
  programId: string;
  cells: RubricCell[];
  criteria: RubricCriteria[];
}

interface RequestBody {
  programId: string;
  rubrics: Rubric[];
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { programId, rubrics }: RequestBody = await req.json();

    const createdRubrics = await Promise.all(
      rubrics.map(async (rubric) => {
        const createdRubric = await prisma.rubric.upsert({
          update: {
            summary: rubric.summary,
            description: rubric.description,
          },
          create: {
            name: rubric.name,
            summary: rubric.summary,
            description: rubric.description,
            programId,
            cells: {
              create: rubric.cells.map((cell) => ({
                columnName: cell.columnName,
                description: cell.description,
                score: cell.score,
              })),
            },
            criteria: {
              create: rubric.criteria.map((criterion) => ({
                title: criterion.title,
                description: criterion.description,
              })),
            },
          },
          include: {
            cells: true,
            criteria: true,
          },
          where: { programId: programId },
        });

        // Create or update levels for rubric
        const levels = await Promise.all(
          rubric.cells.map((cell) =>
            prisma.rubricLevel.upsert({
              where: { columnName_rubricId: { columnName: cell.columnName, rubricId: createdRubric.id } },
              update: {
                description: cell.description,
                score: cell.score,
              },
              create: {
                columnName: cell.columnName,
                description: cell.description,
                score: cell.score,
                rubric: { connect: { id: createdRubric.id } },
              },
            })
          )
        );

        return prisma.rubric.findUnique({
          where: { id: createdRubric.id },
          include: {
            cells: true,
            criteria: true,
            levels: true,
          },
        });
      })
    );

    return new NextResponse(JSON.stringify({ status: 200, body: createdRubrics }));
  } catch (error) {
    console.error('Error creating or updating rubrics:', error);
    return new NextResponse(JSON.stringify({ status: 500, body: 'Failed to create or update rubrics' }));
  } finally {
    await prisma.$disconnect();
  }
}
