import { getSpaceWithIntegrations, getSpaceIdForDomain } from '@/app/api/helpers/space';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  let spaceId;
  if (domain) {
    spaceId = await getSpaceIdForDomain(domain);
  }
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId or domain provided' });
  return NextResponse.json({ status: 200, body: await getSpaceWithIntegrations(spaceId) });
}
