import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { getDecodedJwtFromContext } from '@/app/api/helpers/permissions/getJwtFromContext';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Space } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface SpaceAndDecodedJwt {
  space: Space;
  decodedJwt: JwtPayload & DoDaoJwtTokenPayload;
}

export async function verifyJwtForRequest(req: NextRequest, spaceId: string): Promise<SpaceAndDecodedJwt> {
  const spaceById = await getSpaceById(spaceId);

  const decodedJwt = await getDecodedJwtFromContext(req);
  const user = decodedJwt?.accountId?.toLowerCase();
  if (!user) {
    throw Error('No accountId present in JWT');
  }

  return {
    space: spaceById,
    decodedJwt: decodedJwt!,
  };
}
