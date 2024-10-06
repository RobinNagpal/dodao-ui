import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { authorizeCrypto } from './authorizeCrypto';
import { User } from '@dodao/web-core/types/auth/User';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { AuthOptions } from 'next-auth';

const p = new PrismaClient();
// Configure AWS SES

p.verificationToken;
export const authOptions: AuthOptions = getAuthOptions(
  {
    user: {
      findUnique: p.baseUser.findUnique,
      findFirst: p.baseUser.findFirst,
      upsert: p.baseUser.upsert,
    },
    verificationToken: {
      delete: p.verificationToken.delete,
    },
    adapter: {
      ...PrismaAdapter(p),
      getUserByEmail: async (email: string) => {
        const user = (await p.baseUser.findFirst({ where: { email } })) as User;
        console.log('getUserByEmail', user);
        return user as any;
      },
    },
  },
  authorizeCrypto
);
