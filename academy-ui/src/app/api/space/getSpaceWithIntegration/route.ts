import { NextResponse } from 'next/server';
import { getSpaceWithIntegrations } from '@/app/api/helpers/space';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId passed in request' });
  const response = await getSpaceWithIntegrations(spaceId);
  return NextResponse.json({ status: 200, body: response });
}
