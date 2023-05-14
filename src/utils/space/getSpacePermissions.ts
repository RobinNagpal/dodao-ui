import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { superAdmins } from '@/utils/auth/superAdmins';
import { User } from '@/types/User';

export function getSpacePermissions(space: SpaceWithIntegrationsFragment, user?: User) {
  const isSuperAdminId = user?.id && superAdmins.includes(user.id);
  const isSuperAdminUserName = user?.username && superAdmins.includes(user.username);

  const isSuperAdmin = isSuperAdminId || isSuperAdminUserName;

  const admins = space.admins?.map((id) => id);

  const isCreator = space?.creator && space?.creator?.toLowerCase() === user?.id;

  const isAdmin = isSuperAdmin || (user?.id && (admins?.includes(user?.id) || isCreator));

  return { isAdmin, isSuperAdmin };
}
