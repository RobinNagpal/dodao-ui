import { Session as NextAuthSession } from 'next-auth';

export interface Session extends NextAuthSession {
  userId: string;
  username: string;
  spaceId: string;
  authProvider: string;
  dodaoAccessToken: string;
}

export interface DoDaoJwtTokenPayload {
  spaceId: string;
  userId: string;
  username: string;
  accountId: string;
}
