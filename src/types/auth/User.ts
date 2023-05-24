export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  publicAddress?: string | null;
  spaceId: string;
  username: string;
  authProvider: string;
}
