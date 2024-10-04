import { Space, SpaceIntegration } from '@prisma/client';

export interface UpdateSpaceAndIntegrationResponse extends Space {
    spaceIntegrations: SpaceIntegration | null;
  }