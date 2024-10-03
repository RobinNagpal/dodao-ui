import { BaseSpace, BaseUser } from '@prisma/client';

export interface CreateSpaceResponse {
  space: BaseSpace;
  user: BaseUser;
}
