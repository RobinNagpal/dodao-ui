import { createHash } from '@dodao/web-core/api/auth/createHash';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
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
          console.log('[authOptions] Attempting to find verification token');

          let verificationToken;
          try {
            verificationToken = await p.verificationToken.findFirstOrThrow({
              where: { token: await createHash(`${credentials?.token}${process.env.EMAIL_TOKEN_SECRET!}`) },
            });
            console.log('verificationToken', verificationToken);
            console.log('[authOptions] Verification token found successfully');
          } catch (error) {
            await logError('Failed to find verification token', { token: credentials?.token }, error as Error, credentials?.spaceId);
            console.error('Verification token not found - ', credentials?.token);
            return null;
          }

          if (!verificationToken) {
            await logError('Verification token not found after successful query', { token: credentials?.token }, null, credentials?.spaceId);
            console.error('Verification token not found - ', credentials?.token);
            return null;
          }

          console.log('[authOptions] Deleting verification token');
          try {
            await p.verificationToken.delete({
              where: { token: await createHash(`${credentials?.token}${process.env.EMAIL_TOKEN_SECRET!}`) },
            });
            console.log('[authOptions] Verification token deleted successfully');
          } catch (error) {
            await logError('Failed to delete verification token', { token: credentials?.token }, error as Error, credentials?.spaceId);
          }

          const expired = verificationToken.expires.valueOf() < Date.now();

          console.log('expired', expired, verificationToken.expires.valueOf(), Date.now());
          console.log(`[authOptions] Token expiration check: ${expired ? 'Token expired' : 'Token valid'}`);

          if (expired) {
            await logError(
              'Token expired',
              {
                tokenExpiry: verificationToken.expires.valueOf(),
                currentTime: Date.now(),
                identifier: verificationToken.identifier,
              },
              null,
              credentials?.spaceId
            );
            return null;
          }

          // We do this because we want to allow to login on TidbitsHub only using the email. If a user create a space
          // and then comes back to login via Tidbits hub, this flow will be invoked.
          console.log(`[authOptions] Looking for user with email ${verificationToken.identifier} in space ${credentials?.spaceId}`);

          let user;
          try {
            if (credentials?.spaceId === PredefinedSpaces.TIDBITS_HUB) {
              console.log('[authOptions] Searching in TIDBITS_HUB space');
              user = await p.user.findFirst({
                where: {
                  email: verificationToken.identifier,
                },
              });
              console.log('[authOptions] User search in TIDBITS_HUB completed');
            } else {
              console.log(`[authOptions] Searching in specific space: ${credentials?.spaceId}`);
              user = await p.user.findUnique({
                where: {
                  email_spaceId: {
                    email: verificationToken.identifier,
                    spaceId: credentials?.spaceId!,
                  },
                },
              });
              console.log('[authOptions] User search in specific space completed');
            }
          } catch (error) {
            await logError(
              'Failed to find user',
              {
                email: verificationToken.identifier,
                spaceId: credentials?.spaceId,
              },
              error as Error,
              credentials?.spaceId
            );
          }

          console.log('user - user', user);
          console.log(`[authOptions] User found: ${user ? 'Yes' : 'No'}`);

          if (!user) {
            console.log('[authOptions] User not found in specified space, trying to find in any space');
            let globalUser;
            try {
              globalUser = await p.user.findFirst({
                where: {
                  email: verificationToken.identifier,
                },
              });
              console.log(`[authOptions] Global user search result: ${globalUser ? 'Found' : 'Not found'}`);
            } catch (error) {
              await logError(
                'Failed to find user globally',
                {
                  email: verificationToken.identifier,
                },
                error as Error,
                credentials?.spaceId
              );
            }

            if (!globalUser) {
              await logError(
                'User not found',
                {
                  email: verificationToken.identifier,
                  spaceId: credentials?.spaceId,
                },
                null,
                credentials?.spaceId
              );
              console.error('User not found - ', verificationToken.identifier);
              return null;
            }

            console.warn('User found but not in the space. Creating a new one - ', globalUser);
            console.log(`[authOptions] Creating new user in space ${credentials?.spaceId}`);

            try {
              const newUser = await p.user.create({
                data: {
                  email: verificationToken.identifier,
                  username: verificationToken.identifier,
                  name: globalUser.name,
                  authProvider: 'custom-email',
                  spaceId: credentials?.spaceId!,
                },
              });

              console.log(`[authOptions] User created successfully with ID: ${newUser.id}`);

              return {
                id: globalUser.id,
                name: globalUser.name,
                username: globalUser.name,
              };
            } catch (error) {
              await logError(
                'Failed to create user',
                {
                  email: verificationToken.identifier,
                  spaceId: credentials?.spaceId,
                  authProvider: 'custom-email',
                },
                error as Error,
                credentials?.spaceId
              );

              // Still return the global user info to allow login
              return {
                id: globalUser.id,
                name: globalUser.name,
                username: globalUser.name,
              };
            }
          } else {
            return {
              id: user.id,
              name: user.publicAddress,
              username: user.publicAddress,
            };
          }
        },
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
    adapter: p.adapter,
    callbacks: {
      async session(params): Promise<Session> {
        const { session, user, token } = params;
        console.log('[authOptions] Session callback - Processing session');

        let userInfo: any = {};
        if (token.sub) {
          console.log(`[authOptions] Session callback - Looking up user with ID: ${token.sub}`);
          try {
            const dbUser: User | null = await p.user.findUnique({
              where: { id: token.sub },
            });

            if (dbUser) {
              console.log(`[authOptions] Session callback - User found: ${dbUser.username}`);
              userInfo.username = dbUser.username;
              userInfo.authProvider = dbUser.authProvider;
              userInfo.spaceId = dbUser.spaceId;
              userInfo.id = dbUser.id;
            } else {
              console.log(`[authOptions] Session callback - No user found with ID: ${token.sub}`);
            }
          } catch (error) {
            await logError(
              'Failed to find user in session callback',
              {
                userId: token.sub,
              },
              error as Error
            );
          }
        }
        const doDaoJwtTokenPayload: DoDaoJwtTokenPayload = {
          userId: userInfo.id,
          spaceId: userInfo.spaceId,
          username: userInfo.username,
          accountId: userInfo.id,
        };
        console.log('[authOptions] Session callback - Returning session');
        return {
          userId: userInfo.id,
          ...session,
          ...userInfo,
          dodaoAccessToken: jwt.sign(doDaoJwtTokenPayload, process.env.DODAO_AUTH_SECRET!),
        };
      },

      jwt: async (params) => {
        const { token, user, account, profile, isNewUser } = params;
        console.log('[authOptions] JWT callback - Processing JWT token');

        if (token.sub) {
          console.log(`[authOptions] JWT callback - Looking up user with ID: ${token.sub}`);
          try {
            const dbUser: User | null = await p.user.findUnique({
              where: { id: token.sub },
            });

            if (dbUser) {
              console.log(`[authOptions] JWT callback - User found: ${dbUser.username}`);
              token.spaceId = dbUser.spaceId;
              token.username = dbUser.username;
              token.authProvider = dbUser.authProvider;
              token.accountId = dbUser.id;
            } else {
              console.log(`[authOptions] JWT callback - No user found with ID: ${token.sub}`);
            }
          } catch (error) {
            await logError(
              'Failed to find user in JWT callback',
              {
                userId: token.sub,
              },
              error as Error
            );
          }
        }
        console.log('[authOptions] JWT callback - Returning token');
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
        console.error('[authOptions] NextAuth error:', code, metadata);
        logError(`NextAuth error: ${code}`, metadata || {}).catch((err) => {
          console.error('[authOptions] Failed to log NextAuth error:', err);
        });
      },
      warn(code) {
        console.warn('[authOptions] NextAuth warning:', code);
      },
      debug(code, metadata) {
        console.debug('[authOptions] NextAuth debug:', code, metadata);
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
