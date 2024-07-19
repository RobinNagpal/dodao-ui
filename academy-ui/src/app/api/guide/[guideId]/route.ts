import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params: { guideId } }: { params: { guideId: string } }) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    include: {
      GuideStep: {
        orderBy: {
          stepOrder: 'asc',
        },
      },
    },
  });

  if (!guide) {
    return NextResponse.json({ status: 404, message: 'Guide not found' });
  }

  const transformedGuide = {
    ...guide,
    steps: guide.GuideStep,
  };
  // delete transformedGuide?.GuideStep;
  delete (transformedGuide as { GuideStep?: any }).GuideStep;

  return NextResponse.json({ status: 200, guide: transformedGuide });
}
