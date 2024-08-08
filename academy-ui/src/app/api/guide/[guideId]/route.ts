import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params: { guideId } }: { params: { guideId: string } }) {
  const guide = await prisma.guide.findFirst({
    where: {
      OR: [
        {
          id: guideId,
        },
        {
          uuid: guideId,
        },
      ],
    },
    include: {
      GuideStep: {
        orderBy: {
          stepOrder: 'asc',
        },
      },
    },
  });

  if (!guide) {
    return NextResponse.json({ message: 'Guide not found' }, { status: 404 });
  }

  const transformedGuide = {
    ...guide,
    steps: guide.GuideStep,
  };
  // delete transformedGuide?.GuideStep;
  delete (transformedGuide as { GuideStep?: any }).GuideStep;

  return NextResponse.json({ guide: transformedGuide }, { status: 200 });
}
