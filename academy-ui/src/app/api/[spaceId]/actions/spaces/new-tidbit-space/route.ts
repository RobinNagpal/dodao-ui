import { SpaceTypes } from '@/types/space/SpaceDto';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { GlobalThemeColors } from '@dodao/web-core/components/app/themes';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequest';
import { CreateSpaceResponse } from '@/types/response/CreateSpaceResponse';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { Space } from '@prisma/client';
import { LoginProviders } from '@dodao/web-core/types/deprecated/models/enums';

async function postHandler(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<CreateSpaceResponse>> {
  const mainSpaceId = (await params).spaceId;
  const session = await getDecodedJwtFromContext(req);
  if (!session) throw new Error('User not present in session');

  const spaceData: CreateSpaceRequest = await req.json();

  const spaceInput: Space = {
    id: spaceData.id,
    name: spaceData.name,
    creator: session.username,
    avatar: 'https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png',
    adminUsernamesV1: [
      {
        nameOfTheUser: session.username,
        username: session.username,
      },
    ],
    domains: [],
    authSettings: { enableLogin: true, loginOptions: [LoginProviders.Email] },
    type: SpaceTypes.TidbitsSite,
    features: [],
    themeColors: GlobalThemeColors,
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    inviteLinks: null,
    discordInvite: null,
    telegramInvite: null,
    guideSettings: {},
    socialSettings: {},
    byteSettings: {},
    tidbitsHomepage: null,
  };

  const existingUser = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!existingUser) throw new Error('User does not exist');

  const [space, user] = await prisma.$transaction(async (tx) => {
    const newUserData = {
      name: existingUser.name,
      email: existingUser.email,
      emailVerified: existingUser.emailVerified,
      publicAddress: existingUser.publicAddress,
      username: existingUser.username,
      image: existingUser.image,
      authProvider: existingUser.authProvider,
      phoneNumber: existingUser.phoneNumber,
      spaceId: spaceData.id,
    };

    const updatedUser =
      existingUser.spaceId === mainSpaceId
        ? await tx.user.update({ where: { id: session.userId }, data: { spaceId: spaceData.id } })
        : await tx.user.create({ data: newUserData });

    const createdSpace = await tx.space.create({
      data: {
        ...spaceInput,
        inviteLinks: spaceInput.inviteLinks || {},
        themeColors: undefined,
        tidbitsHomepage: undefined,
      },
    });
    return [createdSpace, updatedUser];
  });

  return NextResponse.json({ space, user }, { status: 200 });
}

export const POST = withErrorHandlingV1<CreateSpaceResponse>(postHandler);
