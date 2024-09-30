import { SpaceTypes } from '@/graphql/generated/generated-types';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { CssTheme, themes } from '@dodao/web-core/components/app/themes';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequest';
import { CreateSpaceResponse } from '@/types/response/CreateSpaceResponse';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { Space } from '@prisma/client';

async function postHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<CreateSpaceResponse>> {
  const session = await getDecodedJwtFromContext(req);
  if (!session) throw new Error('User not present in session');

  const spaceData: CreateSpaceRequest = await req.json();

  const spaceInput: Space = {
    id: spaceData.id,
    name: spaceData.name,
    creator: session?.username,
    avatar: 'https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png',
    adminUsernamesV1: [
      {
        nameOfTheUser: session.username,
        username: session.username,
      },
    ],
    domains: [],
    authSettings: {},
    type: SpaceTypes.TidbitsSite,
    features: [],
    themeColors: themes[CssTheme.GlobalTheme],
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
  };

  const space = await prisma.space.create({
    data: {
      ...spaceInput,
      inviteLinks: spaceInput.inviteLinks || {},
      themeColors: undefined,
      tidbitsHomepage: undefined,
    },
  });

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { spaceId: spaceData.id },
  });

  return NextResponse.json({ space, user }, { status: 200 });
}

export const POST = withErrorHandlingV1<CreateSpaceResponse>(postHandler);
