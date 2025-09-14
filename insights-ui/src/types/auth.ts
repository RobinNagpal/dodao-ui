import { DoDaoJwtTokenPayload, Session } from '@dodao/web-core/types/auth/Session';
import { UserRole } from '@prisma/client';

export interface KoalaGainsJwtTokenPayload extends DoDaoJwtTokenPayload {
  role: UserRole;
  email: string;
}

export interface KoalaGainsSession extends Session {
  email: string;
  role: UserRole;
}
