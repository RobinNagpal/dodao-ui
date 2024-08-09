import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest, { params: { spaceId } }: { params: { spaceId: string } }) {
  const space = await getSpaceWithIntegrations(spaceId);
  if (!space) return NextResponse.json({ body: 'Space not found' }, { status: 404 });

  return NextResponse.json({ space: space }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
