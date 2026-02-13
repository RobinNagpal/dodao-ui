import { SimulationJwtTokenPayload } from '@/types/user';
import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { Session } from '@dodao/web-core/types/auth/Session';
import { createUserAdapter, createVerificationTokenAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient, User as SimulationUser } from '@prisma/client';
import jwt from 'jsonwebtoken';
import CredentialsProvider from 'next-auth/providers/credentials';
import { RequestInternal } from 'next-auth';

const p = new PrismaClient();

export const prismaAdapter = PrismaAdapter(p);

// Create typed adapters from Prisma delegates
const userAdapter = createUserAdapter(p.user);
const verificationTokenAdapter = createVerificationTokenAdapter(p.verificationToken);

const baseAuthOptions = getAuthOptions(
  {
    user: userAdapter,
    verificationToken: verificationTokenAdapter,
    adapter: {
      ...prismaAdapter,
      getUserByEmail: async (email: string) => {
        const user = await p.user.findFirst({ where: { email } });
        console.log('getUserByEmail', user);
        if (!user) return null;
        return {
          ...user,
          email: user.email || email,
          emailVerified: user.emailVerified || null,
        };
      },
    },
  },
  () => Promise.resolve(null),
  {
    callbacks: {
      async session(params): Promise<Session> {
        const { session, user, token } = params;
        console.log('[authOptions] Session callback - Processing session');

        let userInfo: any = {};
        if (token.sub) {
          console.log(`[authOptions] Session callback - Looking up user with ID: ${token.sub}`);
          try {
            const dbUser: SimulationUser | null = await p.user.findUnique({
              where: { id: token.sub },
            });

            if (dbUser) {
              console.log(`[authOptions] Session callback - User found: ${dbUser.username}`);
              userInfo.username = dbUser.username;
              userInfo.authProvider = dbUser.authProvider;
              userInfo.spaceId = dbUser.spaceId;
              userInfo.id = dbUser.id;
              userInfo.role = dbUser.role;
              userInfo.email = dbUser.email;
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
        const doDaoJwtTokenPayload: SimulationJwtTokenPayload = {
          userId: userInfo.id,
          spaceId: userInfo.spaceId,
          username: userInfo.username,
          email: userInfo.email,
          accountId: userInfo.id,
          role: userInfo.role,
        };
        console.log('[authOptions] Session callback - Returning session');
        return {
          userId: userInfo.id,
          ...session,
          user: user?.email ? await p.user.findFirst({ where: { email: user.email } }) : undefined,
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
            const dbUser: SimulationUser | null = await p.user.findUnique({
              where: { id: token.sub },
            });

            if (dbUser) {
              console.log(`[authOptions] JWT callback - User found: ${dbUser.username}`);
              token.userId = dbUser.id;
              token.spaceId = dbUser.spaceId;
              token.username = dbUser.username;
              token.authProvider = dbUser.authProvider;
              token.accountId = dbUser.id;
              token.role = dbUser.role;
              token.email = dbUser.email;
            } else {
              console.log(`[authOptions] JWT callback - No user found with ID: ${token.sub}`);
              token.userId = token.sub;
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
    },
  }
);

// Add sign-in code provider to the base auth options
export const authOptions = {
  ...baseAuthOptions,
  providers: [
    ...baseAuthOptions.providers,
    CredentialsProvider({
      id: 'sign-in-code',
      name: 'Sign-In Code',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Sign-In Code', type: 'text' },
        spaceId: { label: 'Space Id', type: 'text' },
      },
      authorize: async function authorizeSignInCode(
        credentials: Record<'email' | 'code' | 'spaceId', string> | undefined,
        req: Pick<RequestInternal, 'body' | 'query' | 'headers' | 'method'>
      ) {
        console.log('[authOptions] Sign-in code authorization attempt');

        if (!credentials?.code || !credentials?.email) {
          await logError('Sign-in code or email missing', {}, null, credentials?.spaceId);
          return null;
        }

        // Normalize code (uppercase, trim spaces) but keep hyphen
        const normalizedCode = credentials.code.toUpperCase().replace(/\s/g, '');
        const normalizedEmail = credentials.email.toLowerCase().trim();

        const signInCodeRecord = await p.studentSignInCode.findFirst({
          where: {
            code: normalizedCode,
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: {
            user: true,
          },
        });

        if (!signInCodeRecord) {
          await logError('Invalid or expired sign-in code', { code: normalizedCode, email: normalizedEmail }, null, credentials?.spaceId);
          return null;
        }

        const user = signInCodeRecord.user;

        // Verify email matches the user associated with the code
        if (user.email?.toLowerCase() !== normalizedEmail) {
          await logError(
            'Email does not match sign-in code',
            {
              providedEmail: normalizedEmail,
              codeUserEmail: user.email,
              code: normalizedCode,
            },
            null,
            credentials?.spaceId
          );
          return null;
        }

        // Verify user is a student or instructor and belongs to correct space
        if ((user.role !== 'Student' && user.role !== 'Instructor') || user.spaceId !== credentials.spaceId) {
          await logError(
            'Sign-in code user validation failed',
            {
              userId: user.id,
              role: user.role,
              userSpaceId: user.spaceId,
              requestedSpaceId: credentials.spaceId,
            },
            null,
            credentials?.spaceId
          );
          return null;
        }

        // Ensure Account exists for sign-in code authentication
        const existingAccount = await p.account.findFirst({
          where: {
            userId: user.id,
            provider: 'sign-in-code',
          },
        });

        if (!existingAccount) {
          await p.account.create({
            data: {
              userId: user.id,
              type: 'credentials',
              provider: 'sign-in-code',
              providerAccountId: user.email || user.id,
            },
          });
        }

        console.log(`[authOptions] Sign-in code authenticated user: ${user.id}`);

        return {
          id: user.id,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
};
