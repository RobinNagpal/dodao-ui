import { User } from '@dodao/web-core/types/auth/User';
import { VerificationToken } from '@dodao/web-core/types/auth/VerificationToken';
import {
  PrismaUserAdapter,
  PrismaVerificationTokenAdapter,
  PrismaSpaceAdapter,
  UserFindByIdArgs,
  UserFindByEmailSpaceIdArgs,
  UserFindFirstByEmailArgs,
  UserCreateData,
  UserUpsertByPublicAddressArgs,
  VerificationTokenFindArgs,
  VerificationTokenDeleteArgs,
  SpaceFindByIdArgs,
} from '@dodao/web-core/types/prisma/prismaAdapters';
import { WebCoreSpace } from '@dodao/web-core/types/space';

/**
 * Type for Prisma User delegate from any project.
 * This captures the shape of p.user from PrismaClient.
 */
interface PrismaUserDelegate {
  findUnique(args: { where: { id: string } | { email_spaceId: { email: string; spaceId: string } } }): Promise<User | null>;
  findFirst(args: { where: { email?: string } }): Promise<User | null>;
  create(args: { data: UserCreateData }): Promise<User>;
  upsert(args: {
    where: { publicAddress_spaceId: { publicAddress: string; spaceId: string } };
    create: Omit<User, 'id'>;
    update: Partial<UserCreateData>;
  }): Promise<User>;
}

/**
 * Type for Prisma VerificationToken delegate.
 */
interface PrismaVerificationTokenDelegate {
  findFirstOrThrow(args: { where: { token: string } }): Promise<VerificationToken>;
  delete(args: { where: { token: string } }): Promise<VerificationToken | null>;
}

/**
 * Type for Prisma Space delegate.
 */
interface PrismaSpaceDelegate<S extends WebCoreSpace> {
  findUnique(args: { where: { id: string } }): Promise<S | null>;
}

/**
 * Creates a fully typed PrismaUserAdapter from a Prisma user delegate.
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { createUserAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
 *
 * const prisma = new PrismaClient();
 * const userAdapter = createUserAdapter(prisma.user);
 * ```
 */
export function createUserAdapter(prismaUser: PrismaUserDelegate): PrismaUserAdapter {
  return {
    findUniqueById: (args: UserFindByIdArgs) => prismaUser.findUnique(args),
    findUniqueByEmailSpaceId: (args: UserFindByEmailSpaceIdArgs) => prismaUser.findUnique(args),
    findFirstByEmail: (args: UserFindFirstByEmailArgs) => prismaUser.findFirst(args),
    create: (args: { data: UserCreateData }) => prismaUser.create(args),
    upsertByPublicAddress: (args: UserUpsertByPublicAddressArgs) => prismaUser.upsert(args),
  };
}

/**
 * Creates a fully typed PrismaVerificationTokenAdapter from a Prisma verificationToken delegate.
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { createVerificationTokenAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
 *
 * const prisma = new PrismaClient();
 * const verificationTokenAdapter = createVerificationTokenAdapter(prisma.verificationToken);
 * ```
 */
export function createVerificationTokenAdapter(prismaVerificationToken: PrismaVerificationTokenDelegate): PrismaVerificationTokenAdapter {
  return {
    findFirstOrThrow: (args: VerificationTokenFindArgs) => prismaVerificationToken.findFirstOrThrow(args),
    delete: (args: VerificationTokenDeleteArgs) => prismaVerificationToken.delete(args),
  };
}

/**
 * Creates a fully typed PrismaSpaceAdapter from a Prisma space delegate.
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { createSpaceAdapter } from '@dodao/web-core/utils/auth/createPrismaAdapters';
 *
 * const prisma = new PrismaClient();
 * const spaceAdapter = createSpaceAdapter(prisma.space);
 * ```
 */
export function createSpaceAdapter<S extends WebCoreSpace>(prismaSpace: PrismaSpaceDelegate<S>): PrismaSpaceAdapter<S> {
  return {
    findUniqueById: (args: SpaceFindByIdArgs) => prismaSpace.findUnique(args),
  };
}
