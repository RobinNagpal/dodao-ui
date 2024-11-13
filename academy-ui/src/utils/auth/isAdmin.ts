import { Space } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';

export const isAdmin = (session?: Session, space?: Space | SpaceWithIntegrationsDto) => {
  return (
    space &&
    session &&
    (isSuperAdmin(session) || space.adminUsernamesV1.map((s) => s.username.toLowerCase()).some((admin) => admin === session?.username?.toLowerCase()))
  );
};
