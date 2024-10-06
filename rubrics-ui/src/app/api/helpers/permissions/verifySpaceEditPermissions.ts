import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { RubricSpace } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface SpaceAndDecodedJwt {
  space: RubricSpace;
  decodedJwt: (JwtPayload & DoDaoJwtTokenPayload) | null;
}

export async function verifySpaceEditPermissions(context: NextRequest, spaceId: string): Promise<SpaceAndDecodedJwt> {
  const spaceById = await getSpaceById(spaceId);

  const decodedJwt = await checkEditSpacePermission(spaceById, context);

  return {
    space: spaceById,
    decodedJwt,
  };
}
