import { MutationCreateSpaceArgs } from '@/graphql/generated/generated-types';
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
  const { spaceInput } = (await req.json()) as MutationCreateSpaceArgs;

  const spaceInputArgs: Space = {
    admins: spaceInput.admins,
    adminUsernames: spaceInput.adminUsernames,
    adminUsernamesV1: spaceInput.adminUsernamesV1,
    avatar: spaceInput.avatar,
    creator: spaceInput.creator,
    features: spaceInput.features || [],
    id: spaceInput.id,
    type: spaceInput.type,
    inviteLinks: spaceInput.inviteLinks || {},
    name: spaceInput.name,
    skin: spaceInput.skin,
    createdAt: new Date(),
    verified: true,
    updatedAt: new Date(),
    discordInvite: null,
    telegramInvite: null,
    domains: spaceInput.domains,
    botDomains: spaceInput.botDomains || [],
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
      inviteLinks: spaceInput.inviteLinks || {},
      themeColors: undefined,
      tidbitsHomepage: undefined,
    },
  });

  await upsertSpaceIntegrations(spaceInput, doDAOSuperAdmin);

  return NextResponse.json({ status: 200, space: await getSpaceWithIntegrations(spaceInput.id) });
}
