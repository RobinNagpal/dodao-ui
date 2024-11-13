import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { verifySpaceEditPermissions } from '@/app/api/helpers/permissions/verifySpaceEditPermissions';
import { isDoDAOSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { prisma } from '@/prisma';
import { UpsertSpaceInputDto } from '@/types/space/SpaceDto';
import { SpaceTags } from '@/utils/api/fetchTags';
import { Space } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

async function putHandler(req: NextRequest): Promise<NextResponse<Space>> {
  const { spaceInput } = (await req.json()) as { spaceInput: UpsertSpaceInputDto };
  const { decodedJwt, space } = await verifySpaceEditPermissions(req, spaceInput.id);

  const doDAOSuperAdmin = isDoDAOSuperAdmin(decodedJwt!.username);

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

  const updatedSpace = await prisma.space.update({
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
  revalidateTag(SpaceTags.GET_SPACE.toString());
  return NextResponse.json(updatedSpace as Space, { status: 200 });
}

export const PUT = withErrorHandlingV1<Space>(putHandler);
