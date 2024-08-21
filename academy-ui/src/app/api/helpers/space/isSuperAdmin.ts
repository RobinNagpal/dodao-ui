import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { NextRequest } from 'next/server';

const superAdminsFromEnv = process.env.DODAO_SUPERADMINS ? process.env.DODAO_SUPERADMINS.split(',') : [];
const superAdminsArray = [...superAdminsFromEnv, '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9', 'robinnagpal.tiet@gmail.com'].map((u) => u.toLowerCase().trim());
export function isDoDAOSuperAdmin(username: string): boolean {
  if (superAdminsArray.includes(username.toLowerCase())) {
    return true;
  }
  return false;
}

export function isSuperAdminOfDoDAO(username: string): boolean {
  return superAdminsArray.includes(username.toLowerCase());
}

export async function validateSuperAdmin(context: NextRequest) {
  const decoded = await getDecodedJwtFromContext(context);
  if (!isDoDAOSuperAdmin(decoded!.username)) {
    throw new Error(`Not authorized ${decoded?.username}`);
  }
}
