import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log(data);

    for (const entry of data) {
      const rubricRating = await prisma.rubricRating.upsert({
        where: {
          rubricId_userId: {
            rubricId: entry.rubricId,
            userId: entry.userId,
          },
        },
        update: {},
        create: {
          rubricId: entry.rubricId,
          userId: entry.userId,
        },
      });

      await prisma.ratingCellSelection.upsert({
        where: {
          rubricCellId_rubricRatingId: {
            rubricCellId: entry.cellId,
            rubricRatingId: rubricRating.id,
          },
        },
        update: {
          comment: entry.comment,
        },
        create: {
          rubricCellId: entry.cellId,
          rubricRatingId: rubricRating.id,
          comment: entry.comment,
          userId: entry.userId,
        },
      });
    }

    return NextResponse.json({ status: 200, body: 'Data saved successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  try {
    const comments = await prisma.ratingCellSelection.findMany({
      where: {
        userId: userId,
      },
      select: {
        comment: true,
        rubricCellId: true,
      },
    });

    return NextResponse.json({ status: 200, body: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ status: 500, body: 'Internal server error' });
  }
}
