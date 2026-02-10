import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { User } from '@dodao/web-core/types/auth/User';
import { getPrismaCallbacks } from '@dodao/web-core/utils/auth/prismaCallbacks';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { AuthOptions } from 'next-auth';
import { authorizeCrypto } from './authorizeCrypto';

const p = new PrismaClient();

export const authOptions: AuthOptions = getAuthOptions(
  {
    user: p.user,
    verificationToken: p.verificationToken,
    adapter: {
      ...PrismaAdapter(p),
      getUserByEmail: async (email: string) => {
        const user = (await p.user.findFirst({ where: { email } })) as User;
        console.log('getUserByEmail', user);
        return user as any;
      },
    },
  },
  authorizeCrypto,
  {
    callbacks: getPrismaCallbacks({
      user: p.user,
      verificationToken: p.verificationToken,
      space: p.space,
    }) as AuthOptions['callbacks'],
  }
);
