import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { getSpaceWithIntegrations } from '@/app/api/helpers/getSpaceWithIntegrations';
import { isDoDAOSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { upsertSpaceIntegrations } from '@/app/api/helpers/space/upsertSpaceIntegrations';
import { prisma } from '@/prisma';
import { UpsertSpaceInputDto } from '@/types/space/SpaceDto';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { Space } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const decodedJWT = await getDecodedJwtFromContext(req);
  const doDAOSuperAdmin = isDoDAOSuperAdmin(decodedJWT!.username);
  if (!doDAOSuperAdmin) {
    throw new Error('Space not found');
  }
  const { spaceInput } = (await req.json()) as { spaceInput: UpsertSpaceInputDto };

  const spaceInputArgs: Space = {
    adminUsernamesV1: spaceInput.adminUsernamesV1,
    avatar: spaceInput.avatar,
    creator: spaceInput.creator,
    features: spaceInput.features || [],
    id: spaceInput.id,
    type: spaceInput.type,
    inviteLinks: spaceInput.inviteLinks,
    name: spaceInput.name,
    createdAt: new Date(),
    verified: true,
    updatedAt: new Date(),
    discordInvite: null,
    telegramInvite: null,
    domains: spaceInput.domains,
    guideSettings: {},
    authSettings: {},
    socialSettings: {},
    byteSettings: {},
    themeColors: null,
    tidbitsHomepage: null,
  };

  await prisma.space.create({
    data: {
      ...spaceInputArgs,
      inviteLinks: spaceInput.inviteLinks || undefined,
      themeColors: undefined,
      tidbitsHomepage: undefined,
    },
  });

  await upsertSpaceIntegrations(spaceInput, decodedJWT!);

  return NextResponse.json({ space: await getSpaceWithIntegrations(spaceInput.id) }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
