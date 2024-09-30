import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequests';
import { CreateSpaceResponse } from '@/types/response/CreateSpaceResponse';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { Space } from '@prisma/client';

async function postHandler(
  req: NextRequest,
  { params }: { params: { spaceId: string } }
): Promise<NextResponse<CreateSpaceResponse>> {
  const reqBody : CreateSpaceRequest = await req.json();
  const { spaceData, userId } = reqBody;
  
  const spaceInput : Space = {
    id: spaceData.id,
    name: spaceData.name,
    creator: spaceData.creator,
    avatar: spaceData.avatar,
    adminUsernamesV1: spaceData.adminUsernamesV1,
    domains: spaceData.domains,
    authSettings: spaceData.authSettings,
    type: spaceData.type,
    features: [],
    themeColors: null,
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    admins: [],
    adminUsernames: [],
    inviteLinks: null,
    skin: '',
    discordInvite: null,
    telegramInvite: null,
    botDomains: [],
    guideSettings: {},
    socialSettings: {},
    byteSettings: {},
    tidbitsHomepage: null,
  }

  const space = await prisma.space.create({
    data: {
      ...spaceInput,
      inviteLinks: spaceInput.inviteLinks || {},
      themeColors: undefined,
      tidbitsHomepage: undefined,
    }
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { spaceId: spaceData.id },
  });

  return NextResponse.json({ space, user }, { status: 200 });
}

export const POST = withErrorHandlingV1<CreateSpaceResponse>(postHandler);