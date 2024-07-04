// import { MutationAddDiscordCredentialsArgs } from '@/graphql/generated/graphql';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { URLSearchParams } from 'url';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { spaceId, code, redirectUri } = await req.json();
    if (!spaceId) return NextResponse.json({ status: 400, body: 'No Space ID provided' });
    const spaceById = await getSpaceById(spaceId);

    checkEditSpacePermission(spaceById, req);

    const params = {
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      code: code,
      grant_type: 'authorization_code',
      scope: 'identify guilds guilds.join guilds.members.read email connections',
      redirect_uri: redirectUri,
    };

    const urlSearchParams = new URLSearchParams(params);

    const data = urlSearchParams.toString();
    console.log('request-data', data);

    const result = await axios.post('https://discordapp.com/api/oauth2/token', urlSearchParams);

    await prisma.spaceDiscord.create({
      data: {
        id: uuidv4(),
        spaceId: spaceId,
        accessToken: result.data.access_token,
        accessTokenExpiry: parseInt((Date.now() / 1e3).toFixed()) + result.data.expires_in,
        refreshToken: result.data.refresh_token,
        selectedGuideId: result.data.guild.id,
      },
    });

    await prisma.spaceIntegration.update({
      where: {
        spaceId: spaceId,
      },
      data: {
        discordGuildId: result.data.guild.id,
      },
    });

    return spaceById;
  } catch (e) {
    console.error((e as any)?.response?.data);
    throw e;
  }
}
