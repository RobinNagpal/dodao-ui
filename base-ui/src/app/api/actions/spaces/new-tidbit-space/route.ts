import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { GlobalThemeColors } from '@dodao/web-core/components/app/themes';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { CreateSpaceRequest } from '@/types/request/CreateSpaceRequest';
import { CreateSpaceResponse } from '@/types/response/CreateSpaceResponse';
import { BaseSpace } from '@prisma/client';
import { LoginProviders } from '@dodao/web-core/types/deprecated/models/enums';

async function postHandler(req: NextRequest): Promise<NextResponse<CreateSpaceResponse>> {
  const session = await getDecodedJwtFromContext(req);
  if (!session) throw new Error('User not present in session');

  const spaceData: CreateSpaceRequest = await req.json();

  const spaceInput: BaseSpace = {
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

    features: [],
    themeColors: GlobalThemeColors,
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Use a transaction to group the space creation and user update
  const [space, user] = await prisma.$transaction([
    prisma.baseSpace.create({
      data: {
        ...spaceInput,
        themeColors: undefined,
      },
    }),
    prisma.baseUser.update({
      where: { id: session.accountId },
      data: { spaceId: spaceData.id },
    }),
  ]);

  return NextResponse.json({ space, user } as CreateSpaceResponse, { status: 200 });
}

export const POST = postHandler;
