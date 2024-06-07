import { Space, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';

export const isAdmin = (session?: Session, space?: Space | SpaceWithIntegrationsFragment) => {
  return (
    space &&
    session &&
    (isSuperAdmin(session) ||
      space.admins.some((admin) => admin === session.userId) ||
      space.adminUsernames.map((s) => s.toLowerCase()).some((admin) => admin === session?.username?.toLowerCase()) ||
      space.adminUsernamesV1.map((s) => s.username.toLowerCase()).some((admin) => admin === session?.username?.toLowerCase()))
  );
};
