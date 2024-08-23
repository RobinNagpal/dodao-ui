import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
export async function POST(request: NextRequest) {
  try {
    const { rubricId, userId } = await request.json();
    const session = (await getServerSession(authOptions)) as Session | undefined;

    if (!session) {
      return NextResponse.json({ status: 401, error: 'Unauthorized' });
    }
    const selections = await prisma.ratingCellSelection.findMany({
      where: {
        rubricRating: {
          rubricId: rubricId,
          userId: session.userId,
        },
      },
    });

    if (selections.length === 0) {
      return NextResponse.json({ message: 'No selections found' }, { status: 404 });
    }

    await prisma.ratingCellSelection.updateMany({
      where: {
        id: {
          in: selections.map((selection) => selection.id),
        },
      },
      data: {
        status: 'finalized',
      },
    });

    const updatedRubricRating = await prisma.rubricRating.findUniqueOrThrow({
      where: {
        rubricId_userId: {
          rubricId: rubricId,
          userId: session.userId,
        },
      },
      include: {
        selections: true,
      },
    });

    return NextResponse.json(updatedRubricRating, { status: 200 });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
