import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
export async function PUT(req: NextRequest, { params }: { params: { rubricId: string; cellId: string } }) {
  const { rubricId, cellId } = params;
  const { value } = await req.json();

  if (!value) {
    return NextResponse.json({ error: 'Value is required' }, { status: 400 });
  }

  try {
    const updatedCell = await prisma.rubricCell.update({
      where: {
        id: cellId,
      },
      data: {
        description: value,
      },
    });

    return NextResponse.json(updatedCell, { status: 200 });
  } catch (error) {
    console.error('Error updating rubric cell:', error);
    return NextResponse.json({ error: 'Failed to update rubric cell' }, { status: 500 });
  }
}