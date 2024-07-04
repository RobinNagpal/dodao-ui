import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { getToken, JWT } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

const superAdminsFromEnv = process.env.DODAO_SUPERADMINS ? process.env.DODAO_SUPERADMINS.split(',') : [];
const superAdminsArray = [...superAdminsFromEnv, '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9', 'robinnagpal.tiet@gmail.com'].map((u) => u.toLowerCase().trim());
export async function isDoDAOSuperAdmin(req: NextRequest): Promise<DoDaoJwtTokenPayload | null> {
  const token = (await getToken({ req })) as DoDaoJwtTokenPayload | null;
  if (token && superAdminsArray.includes(token?.username.toLowerCase())) {
    return token;
  }
  return null;
}

export function isSuperAdminOfDoDAO(username: string): boolean {
  return superAdminsArray.includes(username.toLowerCase());
}

export async function validateSuperAdmin(req: NextRequest) {
  const decoded = (await getToken({ req })) as DoDaoJwtTokenPayload | null;
  if (!isDoDAOSuperAdmin(req)) {
    throw new Error(`Not authorized ${decoded?.username}`);
  }
}
