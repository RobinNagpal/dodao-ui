import { upsertSpaceIntegrations } from '@/app/api/helpers/space/upsertSpaceIntegrations';
import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { isDoDAOSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const doDAOSuperAdmin = await isDoDAOSuperAdmin(req);
  if (!doDAOSuperAdmin) {
    throw new Error('Space not found');
  }
  const { input } = await req.json();

  const spaceInput: Space = {
    admins: input.admins,
    adminUsernames: input.adminUsernames,
    adminUsernamesV1: input.adminUsernamesV1,
    avatar: input.avatar,
    creator: input.creator,
    features: input.features || [],
    id: input.id,
    type: input.type,
    inviteLinks: input.inviteLinks || {},
    name: input.name,
    skin: input.skin,
    createdAt: new Date(),
    verified: true,
    updatedAt: new Date(),
    discordInvite: null,
    telegramInvite: null,
    domains: input.domains,
    botDomains: input.botDomains || [],
    guideSettings: {},
    authSettings: {},
    socialSettings: {},
    byteSettings: {},
    themeColors: null,
    tidbitsHomepage: null,
  };

  await prisma.space.create({
    data: {
      ...spaceInput,
      inviteLinks: spaceInput.inviteLinks || {},
      themeColors: undefined,
      tidbitsHomepage: undefined,
    },
  });

  await upsertSpaceIntegrations(input, doDAOSuperAdmin);

  return NextResponse.json({ status: 200, body: await getSpaceWithIntegrations(spaceInput.id) });
}
