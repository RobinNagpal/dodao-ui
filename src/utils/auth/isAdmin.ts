import { Space, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@/types/auth/Session';
import { isSuperAdmin } from '@/utils/auth/superAdmins';

export const isAdmin = (session: Session, space: Space | SpaceWithIntegrationsFragment) => {
  return (
    isSuperAdmin(session) ||
    space.admins.some((admin) => admin === session.userId) ||
    space.adminUsernames.map((s) => s.toLowerCase()).some((admin) => admin === session.username.toLowerCase())
  );
};
