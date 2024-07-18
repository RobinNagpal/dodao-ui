import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params: { guideId } }: { params: { guideId: string } }) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    include: {
      GuidesGuideStep: {
        select: {
          guideStep: true,
        },
      },
    },
  });

  if (!guide) {
    return NextResponse.json({ status: 404, message: 'Guide not found' });
  }

  const guideStepsArr = guide.GuidesGuideStep.map((gs) => gs.guideStep);

  // Sort the array based on stepOrder in ascending order
  guideStepsArr.sort((a, b) => a.stepOrder - b.stepOrder);

  const newGuide = { ...guide, steps: guideStepsArr };

  return NextResponse.json({ status: 200, guide: newGuide });
}
