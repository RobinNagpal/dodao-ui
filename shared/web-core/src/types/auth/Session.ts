import { Session as NextAuthSession } from 'next-auth';

export interface Session extends NextAuthSession {
  userId: string;
  username: string;
  spaceId: string;
  authProvider: string;
  dodaoAccessToken: string;
  isAdminOfSpace?: boolean;
  isSuperAdminOfDoDAO?: boolean;
}

export type DoDAOSession = Session;

export interface DoDaoJwtTokenPayload {
  spaceId: string;
  userId: string;
  username: string;
  /**
   * @deprecated - use userId or username instead.
   */
  accountId: string;
  isAdminOfSpace?: boolean;
  isSuperAdminOfDoDAO?: boolean;
}
