import { prisma } from '@/prisma';
import { User, UserRole } from '@prisma/client';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { createSignInCodeForUser } from './sign-in-code-utils';

// Efficient role checking functions - fetch user and check role in one go
export async function requireAdminUser(userId: string, errorMessage = 'Only admins can perform this action'): Promise<User> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.role !== UserRole.Admin) throw new Error(errorMessage);
  return user;
}

export async function requireInstructorUser(userId: string, errorMessage = 'Only instructors can perform this action'): Promise<User> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.role !== UserRole.Instructor) throw new Error(errorMessage);
  return user;
}

export async function requireAdminOrInstructorUser(userId: string, errorMessage = 'Only admins and instructors can perform this action'): Promise<User> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.role !== UserRole.Admin && user.role !== UserRole.Instructor) throw new Error(errorMessage);
  return user;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  role: UserRole;
}

export interface CreateUserResult extends User {
  signInCode?: string;
}

export function isTestUserEmail(email: string) {
  const cleanedEmail = email.toLowerCase().trim();
  return cleanedEmail.includes('@koala-test.com') || cleanedEmail.endsWith('koala-test.com');
}

export async function createNewUser(input: CreateUserInput): Promise<CreateUserResult> {
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

  // Generate sign-in code for students and instructors
  let signInCode: string | undefined;
  if (role === UserRole.Student || role === UserRole.Instructor) {
    const codeRecord = await createSignInCodeForUser(
      user.id,
      user.id, // For initial creation, user creates their own code
      30 // 30 days expiration as number
    );
    signInCode = codeRecord.code;
  }

  return { ...user, signInCode };
}

export async function getOrCreateUser(email: string, role: UserRole, name?: string): Promise<CreateUserResult> {
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
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
      return updatedUser;
    }
    return user;
  } else {
    return createNewUser({ email, name, role });
  }
}
