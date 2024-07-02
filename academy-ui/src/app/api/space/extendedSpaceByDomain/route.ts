import { getSpaceIdForDomain } from '@/app/api/space/getSpace/route';
import { getSpaceWithIntegrations } from '@/app/api/space/getSpaceWithIntegration/route';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  if (!domain) return { status: 400, body: 'No domain provided' };
  const spaceId = await getSpaceIdForDomain(domain as string);
  if (!spaceId) return { status: 400, body: 'No space found for domain' };

  return NextResponse.json({ body: await getSpaceWithIntegrations(spaceId) });
}
