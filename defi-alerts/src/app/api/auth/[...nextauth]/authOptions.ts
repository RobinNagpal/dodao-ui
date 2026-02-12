import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { createUserAdapter, createVerificationTokenAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

// Create typed adapters from Prisma delegates
const userAdapter = createUserAdapter(p.user);
const verificationTokenAdapter = createVerificationTokenAdapter(p.verificationToken);

export const authOptions = getAuthOptions(
  {
    user: userAdapter,
    verificationToken: verificationTokenAdapter,
    adapter: {
      ...PrismaAdapter(p),
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
  () => Promise.resolve(null)
);
