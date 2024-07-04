import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dodaoTeamMates = [
  '0x470579d16401a36BF63b1428eaA7189FBdE5Fee9', // Robin
  'robinnagpal.tiet@gmail.com', // Robin
  '0xbCb6c649Bc1E0ad342a2036ab7C080B622099Bf8', // Dawood
  '0xb0bc2970c3a870e7e3383357aa98770fc8eae3f1', // Sami
];

export async function getDecodedJwtFromContext(req: NextRequest): Promise<DoDaoJwtTokenPayload | null> {
  const token = (await getToken({ req })) as DoDaoJwtTokenPayload | null;
  return token;
}
