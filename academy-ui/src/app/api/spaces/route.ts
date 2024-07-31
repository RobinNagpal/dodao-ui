import { getSpaceWithIntegrations, getAllSpaceIdsForDomain } from '@/app/api/helpers/space';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  if (!domain) return NextResponse.json({ status: 400, body: 'No domain provided' });
  let space = await prisma.space.findFirst({
    where: {
      domains: {
        has: domain,
      },
    },
  });

  if (!space && domain.includes('.tidbitshub.org')) {
    const idFromDomain = domain.split('.')[0];
    space = await prisma.space.findFirst({
      where: {
        id: idFromDomain,
      },
    });
  }

  if ((!space && (domain === 'dodao-ui-robinnagpal.vercel.app' || domain === 'localhost')) || domain.includes('.vercel.app')) {
    let space = await prisma.space.findFirst({
      where: {
        id: {
          equals: 'test-academy-eth',
        },
      },
    });
    return NextResponse.json({ status: 200, body: [space] });
  }

  if (!space) return NextResponse.json({ status: 400, body: 'No space found for domain' });

  return NextResponse.json({ status: 200, body: [space] });
}
