import { SimulationJwtTokenPayload } from '@/types/user';
import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { Session } from '@dodao/web-core/types/auth/Session';
import { createUserAdapter, createVerificationTokenAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient, User as SimulationUser } from '@prisma/client';
import jwt from 'jsonwebtoken';

const p = new PrismaClient();

export const prismaAdapter = PrismaAdapter(p);

// Create typed adapters from Prisma delegates
const userAdapter = createUserAdapter(p.user);
const verificationTokenAdapter = createVerificationTokenAdapter(p.verificationToken);

export const authOptions = getAuthOptions(
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
              token.spaceId = dbUser.spaceId;
              token.username = dbUser.username;
              token.authProvider = dbUser.authProvider;
              token.accountId = dbUser.id;
              token.role = dbUser.role;
              token.email = dbUser.email;
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
    },
  }
);
