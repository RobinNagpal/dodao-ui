import { Session } from 'next-auth';

export interface Session extends Session {
  username: string;
}
