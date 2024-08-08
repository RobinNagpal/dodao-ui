import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params: { spaceId } }: { params: { spaceId: string } }) {
  const space = await getSpaceWithIntegrations(spaceId);
  if (!space) return NextResponse.json({ body: 'Space not found' }, { status: 404 });

  return NextResponse.json({ space: space }, { status: 200 });
}
