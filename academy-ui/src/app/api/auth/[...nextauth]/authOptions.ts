import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { User } from '@dodao/web-core/types/auth/User';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import { PrismaSpaceAdapter, PrismaUserAdapter, PrismaVerificationTokenAdapter } from '@dodao/web-core/types/prisma/prismaAdapters';
import { getPrismaCallbacks } from '@dodao/web-core/utils/auth/prismaCallbacks';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { AuthOptions } from 'next-auth';
import { authorizeCrypto } from './authorizeCrypto';
import { prisma } from '@/prisma';

export const prismaAdapter = PrismaAdapter(prisma);

// Type-safe adapters for academy-ui Prisma schema
const userAdapter: PrismaUserAdapter = {
  findUnique: async (args: any) => {
    return prisma.user.findUnique(args);
  },
  findFirst: async (args: any) => {
    return prisma.user.findFirst(args);
  },
  upsert: async (args: any) => {
    return prisma.user.upsert(args);
  },
  create: async (args: any) => {
    return prisma.user.create(args);
  },
};

const verificationTokenAdapter: PrismaVerificationTokenAdapter = {
  delete: async (args: any) => {
    return prisma.verificationToken.delete(args);
  },
  findFirstOrThrow: async (args: any) => {
    return prisma.verificationToken.findFirstOrThrow(args);
  },
};

const spaceAdapter: PrismaSpaceAdapter<WebCoreSpace> = {
  findUnique: async (args: any) => {
    return prisma.space.findUnique(args);
  },
  findFirst: async (args: any) => {
    return prisma.space.findFirst(args);
  },
};

export const authOptions: AuthOptions = getAuthOptions(
  {
    user: userAdapter,
    verificationToken: verificationTokenAdapter,
    adapter: {
      ...prismaAdapter,
      getUserByEmail: async (email: string) => {
        const user = (await prisma.user.findFirst({ where: { email } })) as User;
        console.log('getUserByEmail', user);
        return user as any;
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
