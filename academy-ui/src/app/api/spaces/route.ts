import { getWithIntegrations } from '@/app/api/helpers/getSpaceWithIntegrations';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { isRequestUserSuperAdmin } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Space } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest): Promise<NextResponse<SpaceWithIntegrationsDto[]>> {
  const searchParams = req.nextUrl.searchParams;
  const domain = searchParams.get('domain');

  const isUserSuperAdmin = await isRequestUserSuperAdmin(req);
  if (isUserSuperAdmin && !domain) {
    const spaces = await prisma.space.findMany();
    return NextResponse.json(spaces as SpaceWithIntegrationsDto[]);
  }

  const space: Space | null = await prisma.space.findFirst({
    where: {
      domains: {
        has: domain,
      },
    },
  });

  if (space) {
    return NextResponse.json([await getWithIntegrations(space)]);
  }

  if (domain?.includes('.tidbitshub.org') || domain?.includes('.tidbitshub-localhost.org')) {
    const idFromDomain = domain.split('.')[0];
    // Reserved subdomains (e.g. `sitemap`) have no matching space. Use findFirst so an unknown
    // subdomain returns an empty list (caller resolves it to "no space") instead of throwing a
    // Prisma "record not found" error that floods the server logs on every crawler request.
    const space = await prisma.space.findFirst({
      where: {
        id: idFromDomain,
      },
    });
    return space ? NextResponse.json([await getWithIntegrations(space)]) : NextResponse.json([]);
  }

  if (domain === 'dodao-ui-robinnagpal.vercel.app' || domain === 'localhost' || domain?.includes('.vercel.app')) {
    const space = await prisma.space.findFirstOrThrow({
      where: {
        id: {
          equals: process.env.DODAO_DEFAULT_SPACE_ID,
        },
      },
    });
    return NextResponse.json([await getWithIntegrations(space)]);
  }

  if (!domain) throw new Error('Domain not provided');
  if (!space) throw new Error('Space not found');

  return NextResponse.json([await getWithIntegrations(space as Space)]);
}

export const GET = withErrorHandlingV1<SpaceWithIntegrationsDto[]>(getHandler);
