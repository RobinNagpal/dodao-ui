import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
export async function PUT(req: NextRequest, { params }: { params: { programId: string } }) {
  const programId = params.programId;
  const { name, details, summary, rubricIds } = await req.json();

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
