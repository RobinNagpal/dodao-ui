import { isRequestUserSuperAdmin } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  const space = await prisma.space.findFirst({
    where: {
      domains: {
        has: domain,
      },
    },
  });

  if (space) {
    return NextResponse.json([space]);
  }

  if (domain?.includes('.tidbitshub.org') || domain?.includes('.tidbitshub-localhost.org')) {
    const idFromDomain = domain.split('.')[0];
    const space = await prisma.space.findFirst({
      where: {
        id: idFromDomain,
      },
    });
    return NextResponse.json([space]);
  }

  if (domain === 'dodao-ui-robinnagpal.vercel.app' || domain === 'localhost' || domain?.includes('.vercel.app')) {
    const space = await prisma.space.findFirst({
      where: {
        id: {
          equals: 'test-academy-eth',
        },
      },
    });
    return NextResponse.json([space]);
  }
  const isUserSuperAdmin = await isRequestUserSuperAdmin(req);
  if (isUserSuperAdmin) {
    return NextResponse.json(await prisma.space.findMany());
  }

  if (!domain) return NextResponse.json('No domain passed', { status: 400 });
  if (!space) return NextResponse.json('No space found for domain', { status: 404 });

  return NextResponse.json([space]);
}

export const GET = withErrorHandling(getHandler);
