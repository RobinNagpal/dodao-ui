import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest, { params: { guideId } }: { params: { guideId: string } }) {
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

export const GET = withErrorHandling(getHandler);
