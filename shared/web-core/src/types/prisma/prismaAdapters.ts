import { User } from '@dodao/web-core/types/auth/User';
import { VerificationToken } from '@dodao/web-core/types/auth/VerificationToken';
import { WebCoreSpace } from '@dodao/web-core/types/space';

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
  findUnique: (args: { where: { id: string } }) => Promise<T | null>;
  findFirst: (args: { where: { id: string } }) => Promise<T | null>;
}
