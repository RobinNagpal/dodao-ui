import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) {
    return NextResponse.json({ error: 'ID and type are required' }, { status: 400 });
  }

  try {
    if (type === 'program') {
      const rubrics = await prisma.programRubricMapping.findMany({
        where: { programId: id },
        select: {
          rubric: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!rubrics || rubrics.length === 0) {
        return NextResponse.json([]);
      }

      const rubricDetails = rubrics.map((mapping) => ({
        rubricId: mapping.rubric.id,
        name: mapping.rubric.name,
      }));

      return NextResponse.json(rubricDetails);
    } else if (type === 'rubric') {
      const programs = await prisma.programRubricMapping.findMany({
        where: { rubricId: id },
        select: {
          program: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!programs || programs.length === 0) {
        console.warn(`No programs found for rubricId: ${id}`);
        return NextResponse.json([]);
      }

      const programDetails = programs.map((mapping) => ({
        programId: mapping.program.id,
        name: mapping.program.name,
      }));

      return NextResponse.json(programDetails);
    } else {
      return NextResponse.json({ error: 'Invalid type provided' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error during database query:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
