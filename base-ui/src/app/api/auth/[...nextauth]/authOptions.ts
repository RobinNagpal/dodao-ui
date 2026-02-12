import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { authorizeCrypto } from './authorizeCrypto';
import { createUserAdapter, createVerificationTokenAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { AuthOptions } from 'next-auth';

const p = new PrismaClient();

// Create typed adapters from Prisma delegates
const userAdapter = createUserAdapter(p.baseUser);
const verificationTokenAdapter = createVerificationTokenAdapter(p.verificationToken);

export const authOptions: AuthOptions = getAuthOptions(
  {
    user: userAdapter,
    verificationToken: verificationTokenAdapter,
    adapter: {
      ...PrismaAdapter(p),
      getUserByEmail: async (email: string) => {
        const user = await p.baseUser.findFirst({ where: { email } });
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
  authorizeCrypto
);
