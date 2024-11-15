import { User } from '@dodao/web-core/types/auth/User';
import { VerificationToken } from '@dodao/web-core/types/auth/VerificationToken';
import { WebCoreSpace } from '@dodao/web-core/types/space';

export interface PrismaUserAdapter {
  findUnique: (args: {
    where: {
      id?: string;
      email_spaceId?: { email: string; spaceId: string };
    };
  }) => Promise<User | null>;
  findFirst: (args: { where: { email: string } }) => Promise<any>;
  upsert: (args: { where: { publicAddress_spaceId: { publicAddress: string; spaceId: string } }; create: Omit<User, 'id'>; update: {} }) => Promise<User>;
  create: (args: { data: Omit<User, 'id'> }) => Promise<User>;
}

export interface PrismaVerificationTokenAdapter {
  delete: (args: { where: { token: string } }) => Promise<VerificationToken | null>;
  findFirstOrThrow: (args: { where: { token: string } }) => Promise<VerificationToken | null>;
}

export interface PrismaSpaceAdapter<T extends WebCoreSpace> {
  findUnique: (args: { where: { id: string } }) => Promise<T | null>;
  findFirst: (args: { where: { id: string } }) => Promise<T | null>;
}
