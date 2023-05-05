import { Session as NextAuthSession } from 'next-auth';

export interface Session extends NextAuthSession {
  username: string;
  spaceId: string;
  authProvider: string;
}
