// see: https://next-auth.js.org/configuration/options
import { authorizeCrypto } from '@/app/api/auth/[...nextauth]/authorizeCrypto';
import { CustomPrismaAdapter } from './customPrismaAdapter';
import { prisma } from '@/prisma';
import { DoDaoJwtTokenPayload, Session } from '@/types/auth/Session';
import { User } from '@/types/auth/User';
import jwt from 'jsonwebtoken';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';
import EmailProvider from 'next-auth/providers/email';
import { Adapter } from 'next-auth/adapters';
import AWS from 'aws-sdk';

// Configure AWS SES
const ses = new AWS.SES({
  region: process.env.AWS_REGION,
});

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
    {
      id: 'near',
      name: 'Near Wallet Auth',
      type: 'credentials',
      credentials: {},
      authorize: async (credentials, req) => {
        console.log('req', req.query);

        const accountId = req.query?.accountId || '';
        const spaceId = req.query?.spaceId || '';

        const user = await prisma.user.upsert({
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
    EmailProvider({
      server: {
        // AWS SES configuration
        host: process.env.EMAIL_SERVER_HOST,
        port: 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // Custom send verification email function
      sendVerificationRequest: ({ identifier: email, url, provider: { server, from } }) => {
        const { host } = new URL(url);
        const link = `${url}&utm_source=${host}`;

        // Email HTML body
        const emailBody = `Your sign in link is <a href="${link}">here</a>.`;

        // Sending email via AWS SES
        ses.sendEmail(
          {
            Source: from,
            Destination: { ToAddresses: [email] },
            Message: {
              Subject: {
                Data: 'Sign in to your account',
              },
              Body: {
                Html: {
                  Data: emailBody,
                },
              },
            },
          },
          (err, info) => {
            if (err) {
              console.error(err);
              throw new Error('Failed to send email');
            } else {
              console.log('Email sent: ', info);
            }
          }
        );
      },
    }),
  ],
  adapter: CustomPrismaAdapter(prisma) as Adapter,
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
        accountId: userInfo.id,
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
