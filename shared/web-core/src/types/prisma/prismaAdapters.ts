import { User } from '@dodao/web-core/types/auth/User';
import { VerificationToken } from '@dodao/web-core/types/auth/VerificationToken';
import { WebCoreSpace } from '@dodao/web-core/types/space';

/**
 * Prisma 6.x introduced stricter WhereUniqueInput types that require at least one unique field.
 * Each project has different User models with varying unique constraints (publicAddress_spaceId,
 * username_spaceId, email_spaceId), making it impossible to define a single shared input type.
 *
 * Solution: Use contravariant input types (accepting any args) while maintaining covariant
 * return types (PromiseLike<User | null>). This allows:
 * - Each project's Prisma delegate to be passed directly (they handle their own input validation)
 * - Type safety on return values (enforcing User, VerificationToken, WebCoreSpace interfaces)
 * - Compatibility with Prisma's Prisma__*Client thenable return types
 *
 * Why PromiseLike instead of Promise:
 * - Prisma delegates return Prisma__*Client<T> which implements PromiseLike<T>, not Promise<T>
 * - Using PromiseLike allows direct assignment without type casting
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyArgs = any;

export interface PrismaUserAdapter {
  findUnique: (args: AnyArgs) => PromiseLike<User | null>;
  findFirst: (args: AnyArgs) => PromiseLike<User | null>;
  upsert: (args: AnyArgs) => PromiseLike<User>;
  create: (args: AnyArgs) => PromiseLike<User>;
}

export interface PrismaVerificationTokenAdapter {
  delete: (args: AnyArgs) => PromiseLike<VerificationToken | null>;
  findFirstOrThrow: (args: AnyArgs) => PromiseLike<VerificationToken | null>;
}

export interface PrismaSpaceAdapter<S extends WebCoreSpace> {
  findUnique: (args: AnyArgs) => PromiseLike<S | null>;
  findFirst: (args: AnyArgs) => PromiseLike<S | null>;
}
