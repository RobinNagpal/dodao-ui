import { User } from '@dodao/web-core/types/auth/User';
import { VerificationToken } from '@dodao/web-core/types/auth/VerificationToken';
import { WebCoreSpace } from '@dodao/web-core/types/space';

// Using 'any' for args to maintain compatibility across Prisma versions (4.x, 5.x, 6.x)
// Prisma 6.x introduced stricter WhereUniqueInput types that require at least one unique field
export interface PrismaUserAdapter {
  findUnique: (args: any) => Promise<User | null>;
  findFirst: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<User>;
  create: (args: any) => Promise<User>;
}

export interface PrismaVerificationTokenAdapter {
  delete: (args: any) => Promise<VerificationToken | null>;
  findFirstOrThrow: (args: any) => Promise<VerificationToken | null>;
}

export interface PrismaSpaceAdapter<T extends WebCoreSpace> {
  findUnique: (args: any) => Promise<T | null>;
  findFirst: (args: any) => Promise<T | null>;
}
