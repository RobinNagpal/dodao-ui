import { getDecodedJwtFromContext } from '@/app/api/helpers/permissions/getJwtFromContext';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  const courseKey = searchParams.get('courseKey');
  if (!spaceId || !courseKey) {
    return NextResponse.json({ status: 400, message: 'Space ID and course key are required' });
  }
  try {
    const jwtString = await getDecodedJwtFromContext(req);
    if (!jwtString) {
      return;
    }

    const decodedJWT = await getDecodedJwtFromContext(req);

    const courseSubmission = await prisma.courseSubmission.findFirst({ where: { spaceId, courseKey, createdBy: decodedJWT!.username } });
    const topicSubmissions = await prisma.courseTopicSubmission.findMany({ where: { spaceId, courseKey, createdBy: decodedJWT!.username } });
    if (courseSubmission) {
      return NextResponse.json({ status: 200, body: { ...courseSubmission, topicSubmissions } });
    }
    return NextResponse.json({ status: 200, body: {} });
  } catch (e) {
    console.log('error', e);
  }
}
