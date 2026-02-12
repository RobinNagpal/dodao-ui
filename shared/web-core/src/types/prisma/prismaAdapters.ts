import { User } from '@dodao/web-core/types/auth/User';
import { VerificationToken } from '@dodao/web-core/types/auth/VerificationToken';
import { WebCoreSpace } from '@dodao/web-core/types/space';

/**
 * ============================================================================
 * PRISMA ADAPTER INTERFACES - Fully Typed
 * ============================================================================
 *
 * These interfaces define the exact methods and argument types used in web-core.
 * Each project must create adapter wrappers that implement these interfaces.
 *
 * USAGE:
 * ------
 * In each project, create an adapter using createUserAdapter(), createVerificationTokenAdapter(), etc.
 * These helper functions wrap the Prisma client and provide the correct types.
 */

// ============================================================================
// User Adapter Types
// ============================================================================

/** Find user by primary key */
export interface UserFindByIdArgs {
  where: { id: string };
}

/** Find user by email + spaceId compound unique */
export interface UserFindByEmailSpaceIdArgs {
  where: {
    email_spaceId: {
      email: string;
      spaceId: string;
    };
  };
}

/** Find user by publicAddress + spaceId compound unique */
export interface UserFindByPublicAddressSpaceIdArgs {
  where: {
    publicAddress_spaceId: {
      publicAddress: string;
      spaceId: string;
    };
  };
}

/** Find first user by email */
export interface UserFindFirstByEmailArgs {
  where: {
    email: string;
  };
}

/** Create user data */
export interface UserCreateData {
  email?: string | null;
  username: string;
  name?: string | null;
  authProvider: string;
  spaceId: string;
  publicAddress?: string | null;
}

/** Upsert user by publicAddress + spaceId */
export interface UserUpsertByPublicAddressArgs {
  where: {
    publicAddress_spaceId: {
      publicAddress: string;
      spaceId: string;
    };
  };
  create: UserCreateData;
  update: Partial<UserCreateData>;
}

/**
 * User adapter interface with fully typed methods.
 * Each project must implement this by wrapping their Prisma client.
 */
export interface PrismaUserAdapter {
  findUniqueById(args: UserFindByIdArgs): Promise<User | null>;
  findUniqueByEmailSpaceId(args: UserFindByEmailSpaceIdArgs): Promise<User | null>;
  findFirstByEmail(args: UserFindFirstByEmailArgs): Promise<User | null>;
  create(args: { data: UserCreateData }): Promise<User>;
  upsertByPublicAddress(args: UserUpsertByPublicAddressArgs): Promise<User>;
}

// ============================================================================
// Verification Token Adapter Types
// ============================================================================

export interface VerificationTokenFindArgs {
  where: { token: string };
}

export interface VerificationTokenDeleteArgs {
  where: { token: string };
}

/**
 * Verification token adapter interface with fully typed methods.
 */
export interface PrismaVerificationTokenAdapter {
  findFirstOrThrow(args: VerificationTokenFindArgs): Promise<VerificationToken>;
  delete(args: VerificationTokenDeleteArgs): Promise<VerificationToken | null>;
}

// ============================================================================
// Space Adapter Types
// ============================================================================

export interface SpaceFindByIdArgs {
  where: { id: string };
}

/**
 * Space adapter interface with fully typed methods.
 */
export interface PrismaSpaceAdapter<S extends WebCoreSpace> {
  findUniqueById(args: SpaceFindByIdArgs): Promise<S | null>;
}
