import { authorizeCrypto } from '@/app/api/auth/[...nextauth]/authorizeCrypto';
import { createHash } from '@/app/api/auth/custom-email/send-verification/createHash';
import { prisma } from '@/prisma';
import { DoDaoJwtTokenPayload, Session } from '@/types/auth/Session';
import { User } from '@/types/auth/User';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AuthOptions, RequestInternal } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import { PrismaUser } from './customPrismaAdapter';

const p = new PrismaClient();
// Configure AWS SES

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
    CredentialsProvider({
      id: 'custom-email',
      name: 'Custom Email Auth',
      credentials: {
        token: { label: 'Token', type: 'text' },
        spaceId: { label: 'Space Id', type: 'text' },
      },
      authorize: async function authorizeCrypto(
        credentials: Record<'token' | 'spaceId', string> | undefined,
        req: Pick<RequestInternal, 'body' | 'query' | 'headers' | 'method'>
      ) {
        const verificationToken = await p.verificationToken.delete({
          where: { token: await createHash(`${credentials?.token}${process.env.EMAIL_TOKEN_SECRET!}`) },
        });

        if (!verificationToken) return null;

        const expired = verificationToken.expires.valueOf() < Date.now();

        if (expired) return null;

        const user = await prisma.user.findUnique({
          where: {
            email_spaceId: {
              email: verificationToken.identifier,
              spaceId: credentials?.spaceId!,
            },
          },
        });
        if (!user) return null;

        return {
          id: user.id,
          name: user.publicAddress,
          username: user.publicAddress,
        };
      },
    }),
    {
      id: 'near',
      name: 'Near Wallet Auth',
      type: 'credentials',
      credentials: {},
      authorize: async (credentials, req) => {
        console.log('req', req.query);

        const accountId = req.query?.accountId || '';
        const spaceId = req.query?.spaceId || '';

        const user = await p.user.upsert({
          where: { publicAddress_spaceId: { publicAddress: accountId, spaceId } },
          create: {
            publicAddress: accountId,
            username: accountId,
            name: accountId,
            authProvider: 'near',
            spaceId,
          },
          update: {},
        });

        console.log('user', user);
        return Promise.resolve(user);
      },
    },
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
  adapter: {
    ...PrismaAdapter(p),
    getUserByEmail: async (email: string) => {
      const user = (await p.user.findFirst({ where: { email } })) as PrismaUser;
      console.log('getUserByEmail', user);
      return user;
    },
  },
  callbacks: {
    async session(params): Promise<Session> {
      const { session, user, token } = params;

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
        accountId: userInfo.id,
      };
      return {
        userId: userInfo.id,
        ...session,
        ...userInfo,
        dodaoAccessToken: jwt.sign(doDaoJwtTokenPayload, process.env.DODAO_AUTH_SECRET!),
      };
    },

    jwt: async (params) => {
      const { token, user, account, profile, isNewUser } = params;

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
  // Due to a NextAuth bug, the default database strategy is no usable
  //  with CredentialsProvider, so we need to set strategy to JWT
  session: {
    strategy: 'jwt',
  },
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    },
  },
};
