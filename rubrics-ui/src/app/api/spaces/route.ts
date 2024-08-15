import { isRequestUserSuperAdmin } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { domain } = await req.json();

  const space = await prisma.space.findFirst({
    where: {
      domains: {
        has: domain,
      },
    },
  });

  if (space) {
    return NextResponse.json({ space }, { status: 200 });
  }
  if (domain?.includes('.myrubrics.com') || domain?.includes('.myrubrics-localhost.com')) {
    const idFromDomain = domain.split('.')[0];
    const space = await prisma.space.findFirst({
      where: {
        id: idFromDomain,
      },
    });
    return NextResponse.json({ space });
  }

  if (
    domain === 'dodao-ui-robinnagpal.vercel.app' ||
    domain === 'localhost' ||
    domain === 'myrubrics.com' ||
    domain === 'myrubrics-localhost.com' ||
    domain?.includes('.vercel.app')
  ) {
    const space = await prisma.space.findFirst({
      where: {
        id: {
          equals: 'test-academy-eth',
        },
      },
    });
    return NextResponse.json({ space }, { status: 200 });
  }
  const isUserSuperAdmin = await isRequestUserSuperAdmin(req);
  if (isUserSuperAdmin) {
    return NextResponse.json(await prisma.space.findMany());
  }
  if (!domain) return NextResponse.json('No domain passed', { status: 400 });
  if (!space) return NextResponse.json('No space found for domain', { status: 404 });

  return NextResponse.json({ space: null }, { status: 200 });
}
