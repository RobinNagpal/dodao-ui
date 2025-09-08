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
