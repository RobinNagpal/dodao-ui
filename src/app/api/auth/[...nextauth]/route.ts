import { authorizeCrypto } from '@/app/api/auth/[...nextauth]/authorizeCrypto';
import { prisma } from '@/prisma';
import { DoDaoJwtTokenPayload, Session } from '@/types/Session';
import { User } from '@/types/User';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import jwt from 'jsonwebtoken';

// see: https://next-auth.js.org/configuration/options
export const authOptions: AuthOptions = {
  // Setting error and signin pages to our /auth custom page
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    // see: https://next-auth.js.org/configuration/providers/credentials
    CredentialsProvider({
      id: 'crypto',
      name: 'Crypto Wallet Auth',
      credentials: {
        publicAddress: { label: 'Public Address', type: 'text' },
        signedNonce: { label: 'Signed Nonce', type: 'text' },
        spaceId: { label: 'Space Id', type: 'text' },
      },
      authorize: authorizeCrypto,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile): User {
        console.log('profile', profile);
        return {
          ...profile,
          username: profile.name || profile.email,
          authProvider: 'discord',
          spaceId: 'dodao-eth-1',
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          name: profile.name,
          email: profile.email,
          emailVerified: profile.email_verified,
          image: profile.picture,
          id: profile.sub,
          username: profile.email || profile.sub,
          authProvider: 'google',
          spaceId: 'dodao-eth-1',
        };
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          ...profile,
          username: profile.name || profile.email,
          authProvider: 'twitter',
          spaceId: 'dodao-eth-1',
        };
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  // Due to a NextAuth bug, the default database strategy is no usable
  //  with CredentialsProvider, so we need to set strategy to JWT
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, user, token }): Promise<Session> {
      let userInfo: any = {};
      if (token.sub) {
        const dbUser: User | null = await prisma.user.findUnique({
          where: { id: token.sub },
        });
        if (dbUser) {
          userInfo.username = dbUser.username;
          userInfo.authProvider = dbUser.authProvider;
          userInfo.spaceId = dbUser.spaceId;
          userInfo.id = dbUser.id;
        }
      }
      const doDaoJwtTokenPayload: DoDaoJwtTokenPayload = {
        userId: userInfo.id,
        spaceId: userInfo.spaceId,
        username: userInfo.username,
      };
      return {
        userId: userInfo.id,
        ...session,
        ...userInfo,
        dodaoAccessToken: jwt.sign(doDaoJwtTokenPayload, process.env.DODAO_AUTH_SECRET!),
      };
    },
    jwt: async ({ token, user, account, profile, isNewUser }) => {
      if (token.sub) {
        const dbUser: User | null = await prisma.user.findUnique({
          where: { id: token.sub },
        });

        if (dbUser) {
          token.spaceId = dbUser.spaceId;
          token.username = dbUser.username;
          token.authProvider = dbUser.authProvider;
        }
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
