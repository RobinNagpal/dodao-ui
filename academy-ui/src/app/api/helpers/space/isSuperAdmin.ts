import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { getDecodedJwtFromContext } from './getJwtFromContext';
import { NextRequest } from 'next/server';

const superAdminsFromEnv = process.env.DODAO_SUPERADMINS ? process.env.DODAO_SUPERADMINS.split(',') : [];
const superAdminsArray = [...superAdminsFromEnv, '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9', 'robinnagpal.tiet@gmail.com'].map((u) => u.toLowerCase().trim());
export async function isDoDAOSuperAdmin(context: NextRequest): Promise<DoDaoJwtTokenPayload | null> {
  const decoded = await getDecodedJwtFromContext(context);
  if (superAdminsArray.includes(decoded!.username.toLowerCase())) {
    return decoded;
  }
  return null;
}

export function isSuperAdminOfDoDAO(username: string): boolean {
  return superAdminsArray.includes(username.toLowerCase());
}

export async function validateSuperAdmin(context: NextRequest) {
  const decoded = await getDecodedJwtFromContext(context);
  if (!isDoDAOSuperAdmin(context)) {
    throw new Error(`Not authorized ${decoded?.username}`);
  }
}
