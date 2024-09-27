import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

// Set of allowed fields for updating users
const ALLOWED_UPDATE_FIELDS = new Set([
  'authProvider',
  'email',
  'username',
  'name',
  'phone_number',
  'spaceId',
  'image',
  'publicAddress',
]);

export async function POST(req: Request) {
  const reqBody = await req.json();
  const { userId, spaceData, userData } = reqBody;

  // 1. Creating the space first
  const spaceInput: Space = {
    id: spaceData.id,
    name: spaceData.name,
    creator: spaceData.creator,
    avatar: spaceData.avatar,
    features: spaceData.features,
    domains: spaceData.domains,
    authSettings: spaceData.authSettings,
    adminUsernamesV1: spaceData.adminUsernamesV1,
    themeColors: spaceData.themeColors,
    verified: spaceData.verified,
    createdAt: spaceData.createdAt,
    updatedAt: spaceData.updatedAt,
    admins: spaceData.admins,
    adminUsernames: spaceData.adminUsernames,
    type: spaceData.type,
    inviteLinks: spaceData.inviteLinks,
    skin: spaceData.skin,
    discordInvite: spaceData.discordInvite,
    telegramInvite: spaceData.telegramInvite,
    botDomains: spaceData.botDomains,
    guideSettings: spaceData.guideSettings,
    socialSettings: spaceData.socialSettings,
    byteSettings: spaceData.byteSettings,
    tidbitsHomepage: spaceData.tidbitsHomepage,
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
  
  // 2. Update the User with the new Space ID
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'User ID is required.' }),
      { status: 400 }
    );
  }

  const fieldsToUpdate = Object.keys(userData || {})
    .filter((key) => ALLOWED_UPDATE_FIELDS.has(key))
    .reduce((obj: any, key) => {
      obj[key] = userData[key];
      return obj;
    }, {});
    
  // Optionally, handle emailVerified separately if you always want to set it during update
  fieldsToUpdate.emailVerified = new Date();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...fieldsToUpdate },
  });

  // 3. Return the space and user as the response
  return NextResponse.json({ space, user }, { status: 200 });

}
