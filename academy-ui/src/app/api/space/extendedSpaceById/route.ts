import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { NextResponse } from 'next/server';

export async function GET(req: Request, res: Response) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return { status: 400, body: 'No spaceId passed in request' };
  const space = await getSpaceWithIntegrations(spaceId);
  if (!space) return { status: 400, body: 'No space found for spaceId ' + spaceId };
  return NextResponse.json({ body: space });
}
