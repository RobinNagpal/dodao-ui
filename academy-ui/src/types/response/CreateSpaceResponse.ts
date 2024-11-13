import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { User } from '@prisma/client';

export interface CreateSpaceResponse {
  space: SpaceWithIntegrationsDto;
  user: User;
}
