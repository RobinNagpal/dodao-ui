export interface UserDto {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  publicAddress?: string;
  spaceId: string;
  username: string;
  authProvider: string;
  phone_number?: string;
}
