import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = await params;
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

export const GET = withErrorHandling(getHandler);
