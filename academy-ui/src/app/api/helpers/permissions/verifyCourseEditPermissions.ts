import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditCoursePermission } from '@/app/api/helpers/space/checkEditCoursePermission';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Space } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface SpaceAndDecodedJwt {
  space: Space;
  decodedJwt: JwtPayload & DoDaoJwtTokenPayload;
}

export async function verifyCourseEditPermissions(context: NextRequest, spaceId: string, courseKey: string): Promise<SpaceAndDecodedJwt> {
  const spaceById = await getSpaceById(spaceId);

  const decodedJwt = await checkEditCoursePermission(spaceById, context, courseKey);

  return {
    space: spaceById,
    decodedJwt,
  };
}
