import { prisma } from '@/prisma';
import { RubricCellRatingRequest } from '@/types/rubricsTypes/types';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { Session } from '@dodao/web-core/types/auth/Session';
export async function POST(req: NextRequest) {
  const data = (await req.json()) as RubricCellRatingRequest;
  const session = (await getServerSession(authOptions)) as Session | undefined;
  if (!session) {
    return NextResponse.json({ status: 401, body: 'Unauthorized' });
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

  return NextResponse.json({ status: 200, body: 'Data saved successfully' });
}

export async function GET(req: NextRequest, { params }: { params: { rubricId: string } }) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
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
      rubricId: params.rubricId,
    },
    include: {
      selections: true,
    },
  });
  return NextResponse.json({ rubricRating }, { status: 200 });
}
