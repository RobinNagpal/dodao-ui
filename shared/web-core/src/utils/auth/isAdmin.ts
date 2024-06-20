import { WebCoreSpace } from '@dodao/web-core/types/space';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';

export const isAdmin = (session?: Session, space?: WebCoreSpace) => {
  return (
    space &&
    session &&
    (isSuperAdmin(session) || space.adminUsernamesV1.map((s) => s.username.toLowerCase()).some((admin) => admin === session?.username?.toLowerCase()))
  );
};
