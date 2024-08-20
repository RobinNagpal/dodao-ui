import { prisma } from '@/prisma';
import { Program } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { programId: string } }): Promise<NextResponse<Program | { error: string }>> {
  const programId = params.programId;

  const program = await prisma.program.findUniqueOrThrow({
    where: { id: programId },
  });

  return NextResponse.json(program);
}

export async function PUT(req: NextRequest, { params }: { params: { programId: string } }) {
  const programId = params.programId;
  const { name, details, summary, rubricIds, spaceId } = await req.json();

  if (!programId) {
    return NextResponse.json({ status: 400, body: 'Missing programId' });
  }

  try {
    const updatedProgram = await prisma.program.update({
      where: { id: programId },
      data: {
        name,
        details,
        summary,
        spaceId,
        rubrics: {
          set: rubricIds.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json({ status: 200, body: updatedProgram });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json({ status: 500, body: 'Failed to update program' });
  }
}
