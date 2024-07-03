import { getSpaceWithIntegrations, getSpaceIdForDomain } from '@/app/api/helpers/space';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  if (!domain) return NextResponse.json({ status: 400, body: 'No domain provided' });
  const spaceId = await getSpaceIdForDomain(domain as string);
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No space found for domain' });

  return NextResponse.json({ status: 200, body: await getSpaceWithIntegrations(spaceId) });
}
