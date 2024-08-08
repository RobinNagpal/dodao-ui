import { getDecodedJwtFromContext } from '@/app/api/helpers/permissions/getJwtFromContext';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  const courseKey = searchParams.get('courseKey');
  if (!spaceId || !courseKey) {
    return NextResponse.json({ status: 400, message: 'Space ID and course key are required' });
  }
  const decodedJWT = await getDecodedJwtFromContext(req);
  const submissions = await prisma.courseTopicSubmission.findMany({
    where: {
      spaceId: spaceId,
      courseKey: courseKey,
      createdBy: decodedJWT!.accountId,
    },
  });

  return NextResponse.json({ status: 200, submissions });
}

export const GET = withErrorHandling(getHandler);
