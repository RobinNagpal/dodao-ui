import { isUserAdminOfSpace } from '@/app/api/helpers/space/checkEditSpacePermission';
import { isDoDAOSuperAdmin } from '@/app/api/helpers/space/isSuperAdmin';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { getAuthOptions } from '@dodao/web-core/api/auth/authOptions';
import { authorizeCrypto } from '@dodao/web-core/api/auth/authorizeCrypto';
import { DoDaoJwtTokenPayload, Session } from '@dodao/web-core/types/auth/Session';
import { User } from '@dodao/web-core/types/auth/User';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient, Space } from '@prisma/client';
import { AuthOptions } from 'next-auth';
import jwt from 'jsonwebtoken';

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
      async session(params): Promise<Session> {
        const { session, user, token } = params;

        let userInfo: any = {};
        if (token.sub) {
          const dbUser: User | null = await p.user.findUnique({
            where: { id: token.sub },
          });
          if (dbUser) {
            userInfo.username = dbUser.username;
            userInfo.authProvider = dbUser.authProvider;
            userInfo.spaceId = dbUser.spaceId;
            userInfo.id = dbUser.id;
          }
        }
        const doDaoJwtTokenPayload: DoDaoJwtTokenPayload = {
          userId: userInfo.id,
          spaceId: userInfo.spaceId,
          username: userInfo.username,
          accountId: userInfo.id,
          isAdminOfSpace: isUserAdminOfSpace(userInfo.username, (await getSpaceServerSide()) as Space),
          isSuperAdminOfDoDAO: isDoDAOSuperAdmin(userInfo.username),
        };
        return {
          userId: userInfo.id,
          ...session,
          ...userInfo,
          dodaoAccessToken: jwt.sign(doDaoJwtTokenPayload, process.env.DODAO_AUTH_SECRET!),
        };
      },
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
            token.isAdminOfSpace = isUserAdminOfSpace(dbUser.username, (await getSpaceServerSide()) as Space);
            token.isSuperAdminOfDoDAO = isDoDAOSuperAdmin(dbUser.username);
          }
        }
        return token;
      },
    },
  }
);
