import { createHash } from '@dodao/web-core/api/auth/createHash';
import { DoDaoJwtTokenPayload, Session } from '@dodao/web-core/types/auth/Session';
import { User } from '@dodao/web-core/types/auth/User';
import { PrismaUserAdapter, PrismaVerificationTokenAdapter } from '@dodao/web-core/types/prisma/prismaAdapters';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import jwt from 'jsonwebtoken';
import { AuthOptions, RequestInternal } from 'next-auth';
import { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import GoogleProvider from 'next-auth/providers/google';
import TwitterProvider from 'next-auth/providers/twitter';

export type PrismaUserHelper = {
  user: PrismaUserAdapter;
  verificationToken: PrismaVerificationTokenAdapter;
  adapter: Adapter;
};

// Configure AWS SES
export function getAuthOptions(
  p: PrismaUserHelper,
  authorizeCrypto: (
    credentials: Record<'publicAddress' | 'signedNonce' | 'spaceId', string> | undefined,
    req: Pick<RequestInternal, 'body' | 'headers' | 'method' | 'query'>
  ) => Promise<{
    id: string;
    name: string | null;
    username: string | null;
    publicAddress: string | null;
  } | null>,
  overrides?: Partial<AuthOptions>
): AuthOptions {
  const authOptions: AuthOptions = {
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
          console.log('authorize - credentials', credentials);

          const verificationToken = await p.verificationToken.findFirstOrThrow({
            where: { token: await createHash(`${credentials?.token}${process.env.EMAIL_TOKEN_SECRET!}`) },
          });
          console.log('verificationToken', verificationToken);

          if (!verificationToken) {
            console.error('Verification token not found - ', credentials?.token);
            return null;
          }

          await p.verificationToken.delete({
            where: { token: await createHash(`${credentials?.token}${process.env.EMAIL_TOKEN_SECRET!}`) },
          });

          const expired = verificationToken.expires.valueOf() < Date.now();

          console.log('expired', expired, verificationToken.expires.valueOf(), Date.now());
          if (expired) return null;

          // We do this because we want to allow to login on TidbitsHub only using the email. If a user create a space
          // and then comes back to login via Tidbits hub, this flow will be invoked.
          const user =
            credentials?.spaceId === PredefinedSpaces.TIDBITS_HUB
              ? await p.user.findFirst({
                  where: {
                    email: verificationToken.identifier,
                  },
                })
              : await p.user.findUnique({
                  where: {
                    email_spaceId: {
                      email: verificationToken.identifier,
                      spaceId: credentials?.spaceId!,
                    },
                  },
                });

          console.log('user - user', user);
          if (!user) {
            const user = await p.user.findFirst({
              where: {
                email: verificationToken.identifier,
              },
            });

            if (!user) {
              console.error('User not found - ', verificationToken.identifier);
              return null;
            }

            console.warn('User found but not in the space. Creating a new one - ', user);
            await p.user.create({
              data: {
                email: verificationToken.identifier,
                username: verificationToken.identifier,
                name: user.name,
                authProvider: 'custom-email',
                spaceId: credentials?.spaceId!,
              },
            });

            return {
              id: user.id,
              name: user.name,
              username: user.name,
            };
          } else {
            return {
              id: user.id,
              name: user.publicAddress,
              username: user.publicAddress,
            };
          }
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
    adapter: p.adapter,
    callbacks: {
      async session(params): Promise<Session> {
        const { session, user, token } = params;

        let userInfo: any = {};
        if (token.sub) {
          const dbUser: User | null = await p.user.findUnique({
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
          const dbUser: User | null = await p.user.findUnique({
            where: { id: token.sub },
          });

          if (dbUser) {
            token.spaceId = dbUser.spaceId;
            token.username = dbUser.username;
            token.authProvider = dbUser.authProvider;
            token.accountId = dbUser.id;
          }
        }
        return token;
      },
      ...(overrides?.callbacks || {}),
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
    cookies: {
      sessionToken: {
        name: `next-auth.session-token`,
        options: {
          httpOnly: true,
          secure: process.env.VERCEL_ENV === 'production' ? true : false,
          path: '/',
          sameSite: 'lax',
          domain: process.env.VERCEL_ENV === 'production' ? '.tidbitshub.org' : undefined,
        },
      },
    },
  };

  return authOptions;
}
