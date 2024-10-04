import { MutationUpdateSpaceArgs } from '@/graphql/generated/generated-types';
import { upsertSpaceIntegrations } from '@/app/api/helpers/space/upsertSpaceIntegrations';
import { getSpaceWithIntegrations } from '@/app/api/helpers/space';
import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { isDoDAOSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { prisma } from '@/prisma';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Space } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { UpdateSpaceAndIntegrationResponse } from '@/types/response/UpdateSpaceAndIntegration';

async function putHandler(req: NextRequest) : Promise<NextResponse<UpdateSpaceAndIntegrationResponse>>  {
  const { spaceInput } = (await req.json()) as MutationUpdateSpaceArgs;
  const { decodedJwt, space } = await verifySpaceEditPermissions(req, spaceInput.id);

  const doDAOSuperAdmin = isDoDAOSuperAdmin(decodedJwt!.username);

  const user: DoDaoJwtTokenPayload = decodedJwt!;

  const spaceInputArgs: Space = {
    admins: spaceInput.admins,
    adminUsernames: spaceInput.adminUsernames,
    adminUsernamesV1: spaceInput.adminUsernamesV1,
    avatar: spaceInput.avatar,
    creator: spaceInput.creator,
    features: spaceInput.features || [],
    id: spaceInput.id,
    inviteLinks: spaceInput.inviteLinks || {},
    name: spaceInput.name,
    skin: spaceInput.skin,
    createdAt: new Date(),
    verified: true,
    updatedAt: new Date(),
    discordInvite: null,
    telegramInvite: null,
    domains: doDAOSuperAdmin ? spaceInput.domains : space.domains,
    botDomains: doDAOSuperAdmin ? spaceInput.botDomains || [] : space.botDomains || [],
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
        inviteLinks: spaceInput.inviteLinks || {
          discordInviteLink: null,
          telegramInviteLink: null,
        },
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
  const updatedSpace = await getSpaceWithIntegrations(spaceInput.id);
  return NextResponse.json( updatedSpace as UpdateSpaceAndIntegrationResponse, { status: 200 });
}

export const PUT = withErrorHandlingV1<UpdateSpaceAndIntegrationResponse>(putHandler);
