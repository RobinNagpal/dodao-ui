import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/prisma';
import { RubricCellRatingRequest } from '@/types/rubricsTypes/types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ rubricId: string }> }) {
  const data = (await req.json()) as RubricCellRatingRequest;
  const session = (await getServerSession(authOptions)) as Session | undefined;
  const { rubricId } = await params;
  if (!session) {
    return NextResponse.json({ status: 401, error: 'Unauthorized' });
  }

  const rubricRating = await prisma.rubricRating.upsert({
    where: {
      rubricId_userId: {
        rubricId: data.rubricId,
        userId: session.userId,
      },
    },
    update: {},
    create: {
      rubricId: data.rubricId,
      userId: session.userId,
    },
  });

  const rubricCell = await prisma.rubricCell.findFirstOrThrow({
    where: {
      id: data.cellId,
    },
  });

  const rubricCellIds = await prisma.rubricCell.findMany({
    where: {
      criteriaId: rubricCell.criteriaId,
    },
  });
  // delete any of the previous ones
  await prisma.ratingCellSelection.deleteMany({
    where: {
      rubricCellId: {
        in: rubricCellIds.map((cell) => cell.id),
      },
      userId: session.userId,
    },
  });

  // Now add the new one
  await prisma.ratingCellSelection.create({
    data: {
      rubricCellId: data.cellId,
      rubricRatingId: rubricRating.id,
      comment: data.comment,
      userId: session.userId,
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
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ rubricId: string }> }) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      {
        error: "Missing 'userId' query parameter",
      },
      { status: 400 }
    );
  }

  const rubricRating = await prisma.rubricRating.findFirst({
    where: {
      userId: userId,
      rubricId: (await params).rubricId,
    },
    include: {
      selections: true,
    },
  });
  return NextResponse.json({ rubricRating }, { status: 200 });
}
