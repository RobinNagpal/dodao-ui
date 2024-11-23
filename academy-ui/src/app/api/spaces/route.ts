import { getSpaceWithIntegrations, getWithIntegrations } from '@/app/api/helpers/getSpaceWithIntegrations';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { isRequestUserSuperAdmin } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Space } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest): Promise<NextResponse<SpaceWithIntegrationsDto[]>> {
  const searchParams = req.nextUrl.searchParams;
  const domain = searchParams.get('domain');

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
    const space = await prisma.space.findFirstOrThrow({
      where: {
        id: idFromDomain,
      },
    });
    return NextResponse.json([await getWithIntegrations(space)]);
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
  const isUserSuperAdmin = await isRequestUserSuperAdmin(req);
  if (isUserSuperAdmin) {
    const spaces = await prisma.space.findMany();
    const spacesWithIntegrations: SpaceWithIntegrationsDto[] = [];
    for (const s of spaces) {
      spacesWithIntegrations.push(await getSpaceWithIntegrations(s.id));
    }
    return NextResponse.json(spacesWithIntegrations);
  }

  if (!domain) throw new Error('Domain not provided');
  if (!space) throw new Error('Space not found');

  return NextResponse.json([await getWithIntegrations(space as Space)]);
}

export const GET = withErrorHandlingV1<SpaceWithIntegrationsDto[]>(getHandler);
