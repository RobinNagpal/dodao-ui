import { DoDaoJwtTokenPayload, Session } from '@dodao/web-core/types/auth/Session';
import { User } from '@dodao/web-core/types/auth/User';
import { PrismaSpaceAdapter, PrismaUserAdapter, PrismaVerificationTokenAdapter } from '@dodao/web-core/types/prisma/prismaAdapters';
import { WebCoreSpace } from '@dodao/web-core/types/space';
import jwt from 'jsonwebtoken';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

export type Awaitable<T> = T | PromiseLike<T>;

export interface DefaultSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

export interface PrismaCallbacksOptions {
  /**
   * This callback is called whenever a session is checked.
   * (Eg.: invoking the `/api/session` endpoint, using `useSession` or `getSession`)
   *
   * ⚠ By default, only a subset (email, name, image)
   * of the token is returned for increased security.
   *
   * If you want to make something available you added to the token through the `jwt` callback,
   * you have to explicitly forward it here to make it available to the client.
   *
   * [Documentation](https://next-auth.js.org/configuration/callbacks#session-callback) |
   * [`jwt` callback](https://next-auth.js.org/configuration/callbacks#jwt-callback) |
   * [`useSession`](https://next-auth.js.org/getting-started/client#usesession) |
   * [`getSession`](https://next-auth.js.org/getting-started/client#getsession) |
   *
   */
  session: (
    params: {
      session: Session;
      token: JWT;
      user: AdapterUser;
    } & {
      /**
       * Available when using {@link SessionOptions.strategy} `"database"`, this is the data
       * sent from the client via the [`useSession().update`](https://next-auth.js.org/getting-started/client#update-session) method.
       *
       * ⚠ Note, you should validate this data before using it.
       */
      newSession: any;
      trigger: 'update';
    }
  ) => Awaitable<Session | DefaultSession>;
  /**
   * This callback is called whenever a JSON Web Token is created (i.e. at sign in)
   * or updated (i.e whenever a session is accessed in the client).
   * Its content is forwarded to the `session` callback,
   * where you can control what should be returned to the client.
   * Anything else will be kept from your front-end.
   *
   * The JWT is encrypted by default.
   *
   * [Documentation](https://next-auth.js.org/configuration/callbacks#jwt-callback) |
   * [`session` callback](https://next-auth.js.org/configuration/callbacks#session-callback)
   */
  jwt: (params: {
    token: JWT;
    user: User | AdapterUser;
    account: any | null;
    profile?: any;
    trigger?: 'signIn' | 'signUp' | 'update';
    isNewUser?: boolean;
    session?: any;
  }) => Awaitable<JWT>;
}

export function getPrismaCallbacks(adapters: {
  user: PrismaUserAdapter;
  verificationToken: PrismaVerificationTokenAdapter;
  space: PrismaSpaceAdapter<WebCoreSpace>;
}): PrismaCallbacksOptions {
  const superAdminsFromEnv = process.env.DODAO_SUPERADMINS ? process.env.DODAO_SUPERADMINS.split(',') : [];
  const superAdminsArray = [...superAdminsFromEnv, '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9', 'robinnagpal.tiet@gmail.com'].map((u) =>
    u.toLowerCase().trim()
  );
  function isDoDAOSuperAdmin(username: string): boolean {
    if (superAdminsArray.includes(username.toLowerCase())) {
      return true;
    }
    return false;
  }

  function isSuperAdminOfDoDAO(username: string): boolean {
    return superAdminsArray.includes(username.toLowerCase());
  }

  async function isUserAdminOfSpace(username: string, spaceId: string) {
    const space = await adapters.space.findUniqueById({ where: { id: spaceId } });
    if (!space) {
      throw new Error('Space not found');
    }
    const isAdminOfSpaceByUserNameByName: boolean = space.adminUsernamesV1.map((u) => u.username.toLowerCase()).includes(username.toLowerCase());

    return space.creator?.toLowerCase() === username || isAdminOfSpaceByUserNameByName;
  }

  return {
    async session(params): Promise<Session> {
      const { session, user, token } = params;

      let userInfo: { username?: string; authProvider?: string; spaceId?: string; id?: string } = {};
      if (token.sub) {
        const dbUser: User | null = await adapters.user.findUniqueById({
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
        userId: userInfo.id || '',
        spaceId: userInfo.spaceId || '',
        username: userInfo.username || '',
        accountId: userInfo.id || '',
        isAdminOfSpace: userInfo.username && userInfo.spaceId ? await isUserAdminOfSpace(userInfo.username, userInfo.spaceId) : false,
        isSuperAdminOfDoDAO: userInfo.username ? isDoDAOSuperAdmin(userInfo.username) : false,
      };
      return {
        ...session,
        ...userInfo,
        userId: userInfo.id || '',
        isAdminOfSpace: userInfo.username && userInfo.spaceId ? await isUserAdminOfSpace(userInfo.username, userInfo.spaceId) : false,
        isSuperAdminOfDoDAO: userInfo.username ? isDoDAOSuperAdmin(userInfo.username) : false,
        dodaoAccessToken: jwt.sign(doDaoJwtTokenPayload, process.env.DODAO_AUTH_SECRET!),
      };
    },
    jwt: async (params) => {
      const { token, user, account, profile, isNewUser } = params;

      if (token.sub) {
        const dbUser: User | null = await adapters.user.findUniqueById({
          where: { id: token.sub },
        });

        if (dbUser) {
          token.spaceId = dbUser.spaceId;
          token.username = dbUser.username;
          token.authProvider = dbUser.authProvider;
          token.accountId = dbUser.id;
          token.isAdminOfSpace = await isUserAdminOfSpace(dbUser.username, dbUser.spaceId);
          token.isSuperAdminOfDoDAO = isDoDAOSuperAdmin(dbUser.username);
        }
      }
      return token;
    },
  };
}
