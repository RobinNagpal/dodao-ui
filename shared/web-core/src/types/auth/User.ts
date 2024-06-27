export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  phoneNumber?: string | null;
  image?: string | null;
  publicAddress?: string | null;
  spaceId: string;
  username: string;
  authProvider: string;
  password?: string | null;
}

export const UserIdKey = 'dodao_user_id';
