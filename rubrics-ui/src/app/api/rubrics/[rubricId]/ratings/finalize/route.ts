import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export async function POST(request: NextRequest) {
  try {
    const { rubricId } = await request.json();
    const session = (await getServerSession(authOptions)) as Session | undefined;

    if (!session) {
      return NextResponse.json({ status: 401, error: 'Unauthorized' });
    }

    const rubricRating = await prisma.rubricRating.findUnique({
      where: {
        rubricId_userId: {
          rubricId,
          userId: session.userId,
        },
      },
      include: {
        selections: true,
      },
    });

    if (!rubricRating || rubricRating.selections.length === 0) {
      return NextResponse.json({ message: 'No selections found' }, { status: 404 });
    }

    await prisma.rubricRating.update({
      where: {
        id: rubricRating.id,
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
    return NextResponse.json({ error: 'Failed to finalize rubric rating' }, { status: 500 });
  }
}
