import { Session } from 'next-auth';

export interface DoDAOSession extends Session {
  username: string;
}
