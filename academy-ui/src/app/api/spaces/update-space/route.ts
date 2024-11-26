import { MutationUpdateSpaceArgs } from '@/graphql/generated/generated-types';
import { upsertSpaceIntegrations } from '@/app/api/helpers/space/upsertSpaceIntegrations';
import { getSpaceWithIntegrations } from '@/app/api/helpers/getSpaceWithIntegrations';
import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { isDoDAOSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { prisma } from '@/prisma';
import { UpsertSpaceInputDto } from '@/types/space/SpaceDto';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Space } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest, res: NextResponse) {
  const { spaceInput } = (await req.json()) as { spaceInput: UpsertSpaceInputDto };
  const { decodedJwt, space } = await verifySpaceEditPermissions(req, spaceInput.id);

  const doDAOSuperAdmin = isDoDAOSuperAdmin(decodedJwt!.username);

  const user: DoDaoJwtTokenPayload = decodedJwt!;

  const spaceInputArgs: Space = {
    adminUsernamesV1: spaceInput.adminUsernamesV1,
    avatar: spaceInput.avatar,
    creator: spaceInput.creator,
    features: spaceInput.features || [],
    id: spaceInput.id,
    inviteLinks: spaceInput.inviteLinks,
    name: spaceInput.name,
    createdAt: new Date(),
    verified: true,
    updatedAt: new Date(),
    discordInvite: null,
    telegramInvite: null,
    domains: doDAOSuperAdmin ? spaceInput.domains : space.domains,
    authSettings: space.authSettings || {},
    guideSettings: space.guideSettings || {},
    socialSettings: space.socialSettings || {},
    byteSettings: space.byteSettings || {},
    themeColors: space.themeColors || null,
    tidbitsHomepage: space.tidbitsHomepage || null,
    type: spaceInput.type || space.type,
  };
  try {
    await prisma.space.update({
      data: {
        ...spaceInputArgs,
        telegramInvite: null,
        discordInvite: null,
        inviteLinks: spaceInput.inviteLinks || undefined,
        guideSettings: spaceInputArgs.guideSettings || {},
        authSettings: spaceInputArgs.authSettings || {},
        byteSettings: spaceInputArgs.byteSettings || {},
        themeColors: spaceInputArgs.themeColors || undefined,
        tidbitsHomepage: spaceInputArgs.tidbitsHomepage || undefined,
        type: spaceInputArgs.type,
      },
      where: {
        id: spaceInput.id,
      },
    });

    await upsertSpaceIntegrations(spaceInput, user);
  } catch (e) {
    console.error(e);
    throw e;
  }
  return NextResponse.json({ space: getSpaceWithIntegrations(spaceInput.id) }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
