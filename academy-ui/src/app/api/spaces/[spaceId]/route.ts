import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest, { params: { spaceId } }: { params: { spaceId: string } }) {
  const space = await getSpaceWithIntegrations(spaceId);
  if (!space) return NextResponse.json({ status: 404, body: 'Space not found' });

  return NextResponse.json({ status: 200, space: space });
}

export const GET = withErrorHandling(getHandler);
