import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const operations = data.map((entry: { criteria: string; score: number; comment: string; cellId: string; userId: string; rubricId: string }) => {
      return prisma.$transaction(async (prisma) => {
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
      });
    });

    await Promise.all(operations);

    return NextResponse.json({ status: 200, body: 'Data saved successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, body: 'An error occurred' });
  }
}
