import { Space, User } from '@prisma/client';

export interface CreateSpaceResponse {
  space: Space;
  user: User;
}
