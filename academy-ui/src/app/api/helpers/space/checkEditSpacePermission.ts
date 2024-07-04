import { dodaoTeamMates, getDecodedJwtFromContext } from '@/app/api/helpers/space/getJwtFromContext';
import { isDoDAOSuperAdmin, isSuperAdminOfDoDAO } from '@/app/api/helpers/space/isSuperAdmin';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Space } from '@prisma/client';
import { IncomingMessage } from 'http';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

/**
 * @deprecated - see dodaoTeamMates in getJwtFromContext.ts. That already checks for it.
 *               May be this is not needed anymore.?
 *
 * @param context
 */
async function isDoDAOMember(context: NextRequest): Promise<(JwtPayload & DoDaoJwtTokenPayload) | null> {
  const decoded = await getDecodedJwtFromContext(context);
  if (dodaoTeamMates.map((u) => u.toLowerCase()).includes(decoded!.username.toLowerCase())) {
    return decoded;
  }
  return null;
}

export function isUserAdminOfSpace(decodedJWT: DoDaoJwtTokenPayload, space: Space) {
  const user = decodedJWT.accountId.toLowerCase();

  if (!user) {
    throw Error('No accountId present in JWT');
  }
  const spaceAdmins = [space.creator.toLowerCase(), ...space.admins.map((admin) => admin.toLowerCase())];

  const isAdminOfSpace: boolean = spaceAdmins.includes(user.toLowerCase());

  const isAdminOfSpaceByUserName: boolean = space.adminUsernames.map((u) => u.toLowerCase()).includes(decodedJWT.username.toLowerCase());
  const isAdminOfSpaceByUserNameByName: boolean = space.adminUsernamesV1.map((u) => u.username.toLowerCase()).includes(decodedJWT.username.toLowerCase());

  const canEditSpace = isAdminOfSpace || isAdminOfSpaceByUserName || isSuperAdminOfDoDAO(user) || isAdminOfSpaceByUserNameByName;
  return { decodedJWT, canEditSpace, user };
}

export async function canEditGitSpace(context: NextRequest, space: Space) {
  const doDAOMember = await isDoDAOMember(context);

  if (doDAOMember && space.id === 'test-academy-eth') {
    return { decodedJWT: doDAOMember, canEditSpace: true, user: doDAOMember.accountId.toLowerCase() };
  }

  const isCreator =
    space.creator.toLowerCase() === (await getDecodedJwtFromContext(context))?.username.toLowerCase() ||
    space.creator.toLowerCase() === (await getDecodedJwtFromContext(context))?.accountId.toLowerCase();

  if (isCreator) {
    return {
      decodedJWT: await getDecodedJwtFromContext(context),
      canEditSpace: true,
      user: (await getDecodedJwtFromContext(context))?.accountId.toLowerCase(),
    };
  }

  const doDAOAdmin = await isDoDAOSuperAdmin(context);

  if (doDAOAdmin) {
    return { decodedJWT: doDAOAdmin, canEditSpace: true, user: doDAOAdmin.accountId.toLowerCase() };
  }

  const decodedJWT = await getDecodedJwtFromContext(context);

  return isUserAdminOfSpace(decodedJWT!, space);
}

export async function checkEditSpacePermission(space: Space, req: NextRequest): Promise<(JwtPayload & DoDaoJwtTokenPayload) | null> {
  const { decodedJWT, canEditSpace } = await canEditGitSpace(req, space);

  if (!canEditSpace) {
    throw new Error(
      'Not allowed to edit space :' +
        JSON.stringify({
          decodedJWT,
        })
    );
  }

  return decodedJWT;
}

export function checkSpaceIdAndSpaceInEntityAreSame(spaceId: string, entitySpaceId: string) {
  if (entitySpaceId !== spaceId) {
    throw new Error('Space id and entity space id are not same - ' + spaceId + ' - ' + entitySpaceId);
  }
}
