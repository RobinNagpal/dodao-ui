import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { name, summary, description, criteria, programId, evaluationParameters } = await req.json();

    if (!name || !summary || !criteria || !programId || !evaluationParameters) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(evaluationParameters) || evaluationParameters.length === 0) {
      return NextResponse.json({ error: 'Evaluation parameters are required and must be an array' }, { status: 400 });
    }

    for (const param of evaluationParameters) {
      if (!param.title || !param.description) {
        return NextResponse.json({ error: 'Each evaluation parameter must have a title and description' }, { status: 400 });
      }
    }

    const newRubric = await prisma.rubric.create({
      data: {
        name,
        summary,
        description,
        criteria,
        program: { connect: { id: programId } },
        RubricEvaluationParameter: {
          create: evaluationParameters.map((param) => ({
            title: param.title,
            description: param.description,
          })),
        },
      },
    });

    return NextResponse.json({ status: '200', body: newRubric });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
