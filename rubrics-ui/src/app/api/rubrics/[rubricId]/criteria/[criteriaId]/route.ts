import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { rubricId: string; criteriaId: string } }) {
  const { rubricId, criteriaId } = params;

  const { newContent } = await request.json();

  if (!newContent) {
    return NextResponse.json({ error: 'New content is required' }, { status: 400 });
  }

  try {
    const updatedCriteria = await prisma.rubricCriteria.updateMany({
      where: {
        id: criteriaId,
        rubricId: rubricId,
      },
      data: {
        title: newContent,
      },
    });

    if (updatedCriteria.count === 0) {
      return NextResponse.json({ error: 'Criteria not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Criteria updated successfully' });
  } catch (error) {
    console.error('Database update failed', error);
    return NextResponse.json({ error: 'Failed to update criteria' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { criteriaId } = await req.json();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.rubricCriteria.update({
        where: { id: criteriaId },
        data: { isArchived: true },
      });

      await tx.rubricCell.updateMany({
        where: { criteriaId: criteriaId },
        data: { isArchived: true },
      });
    });

    return NextResponse.json({ status: 200, body: { message: 'Criteria and associated cells archived successfully' } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}
