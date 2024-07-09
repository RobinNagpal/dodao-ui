import { getSpaceWithIntegrations, getAllSpaceIdsForDomain } from '@/app/api/helpers/space';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  if (!domain) return NextResponse.json({ status: 400, body: 'No domain provided' });
  const spaceIds = await getAllSpaceIdsForDomain(domain as string);
  if (!spaceIds) return NextResponse.json({ status: 400, body: 'No space found for domain' });

  const spaces = await Promise.all(spaceIds.map((spaceId) => getSpaceWithIntegrations(spaceId)));

  return NextResponse.json({ status: 200, body: spaces });
}
