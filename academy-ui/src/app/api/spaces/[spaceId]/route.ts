import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params: { spaceId } }: { params: { spaceId: string } }) {
  const space = await getSpaceWithIntegrations(spaceId);
  if (!space) return NextResponse.json({ status: 404, body: 'Space not found' });

  return NextResponse.json({ status: 200, space: space });
}
