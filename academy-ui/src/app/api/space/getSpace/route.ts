import { QuerySpaceArgs } from '@/graphql/generated/generated-types';
import { getSpaceWithIntegrations } from '@/app/api/space/getSpaceWithIntegration/route';
import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';

export async function getSpaceIdForDomain(domain: string) {
  const space = await prisma.space.findFirst({
    where: {
      OR: [
        {
          domains: {
            has: domain,
          },
        },
        {
          botDomains: {
            has: domain,
          },
        },
      ],
    },
  });
  if (space) {
    return space.id;
  }

  if (domain === 'dodao-ui-robinnagpal.vercel.app' || domain === 'localhost') {
    return 'test-academy-eth';
  }

  return 'test-academy-eth';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  let spaceId;
  if (domain) {
    spaceId = await getSpaceIdForDomain(domain);
  }
  if (!spaceId) {
    throw new Error('No spaceId or domain provided');
  }
  return NextResponse.json({ status: 200, body: await getSpaceWithIntegrations(spaceId) });
}
