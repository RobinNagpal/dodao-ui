import { isDoDAOSuperAdmin } from '@/app/api/helpers/auth/isSuperAdmin';
import { Space } from '@prisma/client';

/**
 *
 * @param username
 * @param space
 */

export function isUserAdminOfSpace(username: string, space: Space) {
  const isUserAdminOfSpace = isAdminOfSpace(space, username);

  return isUserAdminOfSpace || isDoDAOSuperAdmin(username);
}

function isAdminOfSpace(space: Space, username: string) {
  const spaceAdmins = [space.creator.toLowerCase(), ...space.admins.map((admin) => admin.toLowerCase())];

  const isAdminOfSpace: boolean = spaceAdmins.includes(username);

  const isAdminOfSpaceByUserName: boolean = space.adminUsernames.map((u) => u.toLowerCase()).includes(username.toLowerCase());
  const isAdminOfSpaceByUserNameByName: boolean = space.adminUsernamesV1.map((u) => u.username.toLowerCase()).includes(username.toLowerCase());
  return isAdminOfSpace || isAdminOfSpaceByUserName || isAdminOfSpaceByUserNameByName;
}
