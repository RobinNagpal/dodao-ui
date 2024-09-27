import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function POST(req: Request) {
  console.log("dawood in space/upsert");
  const reqBody = await req.json();

  const spaceInput: Space = {
    id: reqBody.id,
    name: reqBody.name,
    creator: reqBody.creator,
    avatar: reqBody.avatar,
    features: reqBody.features,
    domains: reqBody.domains,
    authSettings: reqBody.authSettings,
    adminUsernamesV1: reqBody.adminUsernamesV1,
    themeColors: reqBody.themeColors,
    verified: reqBody.verified,
    createdAt: reqBody.createdAt,
    updatedAt: reqBody.updatedAt,
    admins: reqBody.admins,
    adminUsernames: reqBody.adminUsernames,
    type: reqBody.type,
    inviteLinks: reqBody.inviteLinks,
    skin: reqBody.skin,
    discordInvite: reqBody.discordInvite,
    telegramInvite: reqBody.telegramInvite,
    botDomains: reqBody.botDomains,
    guideSettings: reqBody.guideSettings,
    socialSettings: reqBody.socialSettings,
    byteSettings: reqBody.byteSettings,
    tidbitsHomepage: reqBody.tidbitsHomepage,
  };

  // Use the same object for both update and create
  const space = await prisma.space.create({
    data: {
      ...spaceInput,
      inviteLinks: spaceInput.inviteLinks || {},
      themeColors: undefined,
      tidbitsHomepage: undefined,
    }
  });
  
  // const space = await prisma.space.upsert({
  //   where: { id: spaceInput.id },
  //   update: { ...spaceInput, inviteLinks: spaceInput.inviteLinks || {}, themeColors: undefined, tidbitsHomepage: undefined },
  //   create: { ...spaceInput, inviteLinks: spaceInput.inviteLinks || {}, themeColors: undefined, tidbitsHomepage: undefined },
  // })
  
  return NextResponse.json({ space }, { status: 200 });
}
