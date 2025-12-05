import { prisma } from '@/prisma';
import { User, UserRole } from '@prisma/client';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';

export interface CreateUserInput {
  email: string;
  name?: string;
  role: UserRole;
}

export function isTestUserEmail(email: string) {
  const cleanedEmail = email.toLowerCase().trim();
  return cleanedEmail.includes('@koala-test.com') || cleanedEmail.endsWith('koala-test.com');
}

export async function createNewUser(input: CreateUserInput): Promise<User> {
  const { email, name, role } = input;
  const isTestUser = isTestUserEmail(email);
  const user = await prisma.user.create({
    data: {
      email: email,
      name: name,
      spaceId: KoalaGainsSpaceId,
      username: email,
      authProvider: 'custom-email',
      role: role,
      isTestUser: isTestUser,
    },
  });
  return user;
}

export async function getOrCreateUser(email: string, role: UserRole, name?: string): Promise<User> {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user && user.role !== role) {
    throw new Error('User already exists with a different role');
  }

  if (user) {
    // Populate name for legacy users if available
    if (!user.name && name) {
      return prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }
    return user;
  } else {
    return createNewUser({ email, name, role });
  }
}
