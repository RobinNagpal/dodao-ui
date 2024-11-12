import { prisma } from '@/prisma';
import { Program } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse<Program[] | { error: string }>> {
  const url = new URL(req.url);
  const spaceId = url.searchParams.get('spaceId');

  if (!spaceId) {
    return NextResponse.json({ error: 'Missing spaceId parameter' }, { status: 400 });
  }

  const programs = await prisma.program.findMany({
    where: {
      spaceId: spaceId,
    },
  });
  return NextResponse.json(programs);
}

export async function POST(req: NextRequest) {
  try {
    const {
      id,
      name,
      details,
      summary,
      rubricIds,
      spaceId,
    }: { id?: string; name: string; details: string; summary: string; rubricIds?: string[]; spaceId: string } = await req.json();

    let programData: any = {
      name,
      details,
      summary,
      spaceId,
    };

    let createdProgram;

    if (rubricIds && rubricIds.length > 0) {
      const rubrics = await prisma.rubric.findMany({
        where: {
          id: {
            in: rubricIds,
          },
        },
      });

      createdProgram = await prisma.program.create({
        data: {
          ...programData,
          rubrics: {
            create: rubrics.map((rubric) => ({
              rubric: { connect: { id: rubric.id } },
            })),
          },
        },
        include: {
          rubrics: true,
        },
      });
    } else {
      createdProgram = await prisma.program.create({
        data: programData,
      });
    }

    return NextResponse.json({ status: 200, body: createdProgram });
  } catch (error) {
    console.log('Error creating program:', error);
    return NextResponse.json({ status: 500, body: 'Failed to create program' });
  }
}
