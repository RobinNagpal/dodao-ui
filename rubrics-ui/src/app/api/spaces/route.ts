import { isRequestUserSuperAdmin } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  const space = await prisma.rubricSpace.findFirst({
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
    const space = await prisma.rubricSpace.findFirst({
      where: {
        id: idFromDomain,
      },
    });
    return NextResponse.json({ space });
  }
  if (domain === 'myrubrics.com' || domain === 'myrubrics-localhost.com') {
    const space = await prisma.rubricSpace.findFirst({
      where: {
        id: {
          equals: 'my-rubrics-home',
        },
      },
    });
    return NextResponse.json({ space }, { status: 200 });
  }

  if (domain === 'dodao-ui-robinnagpal.vercel.app' || domain === 'localhost' || domain?.includes('.vercel.app')) {
    const space = await prisma.rubricSpace.findFirst({
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
    return NextResponse.json(await prisma.rubricSpace.findMany());
  }

  if (!domain) return NextResponse.json('No domain passed ' + domain, { status: 400 });
  if (!space) return NextResponse.json('No space found for domain - ' + domain, { status: 404 });
}
