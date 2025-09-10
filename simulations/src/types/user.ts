import { DoDaoJwtTokenPayload, Session } from '@dodao/web-core/types/auth/Session';
import { UserRole } from '@prisma/client';
/**
 * User-related type definitions
 */

/**
 * Represents a user in the system
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SimulationJwtTokenPayload extends DoDaoJwtTokenPayload {
  role: UserRole;
  email: string;
}

export interface SimulationSession extends Session {
  email: string;
  role: UserRole;
}
