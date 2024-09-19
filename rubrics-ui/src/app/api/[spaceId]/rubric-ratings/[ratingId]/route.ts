import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
export async function DELETE(req: Request) {
  try {
    const { userId, rubricId } = await req.json();

    if (!userId || !rubricId) {
      return NextResponse.json({ error: 'Missing userId or rubricId' }, { status: 400 });
    }

    await prisma.ratingCellSelection.deleteMany({
      where: {
        rubricRating: {
          rubricId: rubricId,
          userId: userId,
        },
      },
    });

    const updatedRubricRating = await prisma.rubricRating.findUniqueOrThrow({
      where: {
        rubricId_userId: {
          rubricId: rubricId,
          userId: userId,
        },
      },
      include: {
        selections: true,
      },
    });

    return NextResponse.json(updatedRubricRating, { status: 200 });
  } catch (error) {
    console.error('Error deleting selections:', error);
    return NextResponse.json({ error: 'Failed to delete selections' }, { status: 500 });
  }
}
