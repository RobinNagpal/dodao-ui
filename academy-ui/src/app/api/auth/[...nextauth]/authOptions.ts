import { isUserAdminOfSpace } from '@/app/api/helpers/auth/checkEditSpacePermission';
import { isDoDAOSuperAdmin } from '@/app/api/helpers/auth/isSuperAdmin';
import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { authorizeCrypto } from '@dodao/web-core/api/auth/authorizeCrypto';
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
      findUnique: p.user.findUnique,
      findFirst: p.user.findFirst,
      upsert: p.user.upsert,
    },
    verificationToken: {
      delete: p.verificationToken.delete,
    },
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
    callbacks: {
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
            token.isAdminOfSpace = isUserAdminOfSpace(dbUser.username);
            token.isSuperAdminOfDoDAO = isDoDAOSuperAdmin(dbUser.username);
          }
        }
        return token;
      },
    },
  }
);
