import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { createUserAdapter, createVerificationTokenAdapter, createSpaceAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
import { getPrismaCallbacks } from '@dodao/web-core/utils/auth/prismaCallbacks';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { AuthOptions } from 'next-auth';
import { authorizeCrypto } from './authorizeCrypto';

const p = new PrismaClient();

// Create typed adapters from Prisma delegates
const userAdapter = createUserAdapter(p.user);
const verificationTokenAdapter = createVerificationTokenAdapter(p.verificationToken);
const spaceAdapter = createSpaceAdapter(p.space);

export const authOptions: AuthOptions = getAuthOptions(
  {
    user: userAdapter,
    verificationToken: verificationTokenAdapter,
    adapter: {
      ...PrismaAdapter(p),
      getUserByEmail: async (email: string) => {
        const user = await p.user.findFirst({ where: { email } });
        console.log('getUserByEmail', user);
        if (!user) return null;
        // AdapterUser requires email to be string, not null/undefined
        return {
          ...user,
          email: user.email || email,
          emailVerified: user.emailVerified || null,
        };
      },
    },
  },
  authorizeCrypto,
  {
    callbacks: getPrismaCallbacks({
      user: userAdapter,
      verificationToken: verificationTokenAdapter,
      space: spaceAdapter,
    }) as AuthOptions['callbacks'],
  }
);
