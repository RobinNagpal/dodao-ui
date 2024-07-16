import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
  const url = new URL(req.url);
  const programId = url.searchParams.get('programId');

  if (!programId) {
    return NextResponse.json({ status: 400, body: 'programId is required' });
  }

  try {
    const program = await prisma.program.findUnique({
      where: { id: Number(programId) },
      include: {
        rubrics: {
          include: {
            levels: true,
            criteria: true,
            RubricCell: true,
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ status: 404, body: 'Program not found' });
    }

    const formattedProgram = {
      id: program.id,
      name: program.name,
      details: program.details,
      rubrics: program.rubrics.map((rubric) => ({
        id: rubric.id,
        name: rubric.name,
        summary: rubric.summary,
        description: rubric.description,
        levels: rubric.levels.map((level) => ({
          id: level.id,
          columnName: level.columnName,
          description: level.description,
          score: level.score,
        })),
        criteria: rubric.criteria.map((criteria) => ({
          id: criteria.id,
          title: criteria.title,
        })),
        RubricCell: rubric.RubricCell.map((cell) => ({
          id: cell.id,
          description: cell.description,
          levelId: cell.levelId,
          criteriaId: cell.criteriaId,
        })),
      })),
    };

    return NextResponse.json({ status: 200, body: formattedProgram });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}
