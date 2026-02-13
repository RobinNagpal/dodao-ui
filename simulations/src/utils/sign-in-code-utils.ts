import { prisma } from '@/prisma';
import { StudentSignInCode } from '@prisma/client';

/**
 * Generate a random sign-in code
 * @param prefix Optional prefix for the code (e.g., "KG")
 * @returns A sign-in code string
 */
export function generateSignInCode(prefix?: string): string {
  // Exclude confusing characters: 0, O, I, l, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}-${code}` : code;
}

/**
 * Create a sign-in code for a user
 * @param userId The ID of the user
 * @param createdById The ID of the user creating the code
 * @param expiresInDays Optional number of days until expiration (null for no expiration)
 * @returns The created StudentSignInCode
 */
export async function createSignInCodeForUser(userId: string, createdById: string, expiresInDays?: number): Promise<StudentSignInCode> {
  let code = generateSignInCode('KG');
  let isUnique = false;

  // Ensure uniqueness (store and compare with full code including prefix + hyphen)
  while (!isUnique) {
    const existing = await prisma.studentSignInCode.findUnique({
      where: { code },
    });
    if (!existing) {
      isUnique = true;
    } else {
      code = generateSignInCode('KG');
    }
  }

  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

  return prisma.studentSignInCode.create({
    data: {
      userId,
      code,
      createdById,
      expiresAt,
      isActive: true,
    },
  });
}

/**
 * Normalize a sign-in code for comparison
 * - Uppercase
 * - Remove whitespace
 * - Preserve hyphen so codes must include it (e.g. KG-ABC123)
 * @param code The raw code input
 * @returns Normalized code
 */
export function normalizeSignInCode(code: string): string {
  return code.toUpperCase().replace(/\s/g, '');
}

/**
 * Validate and retrieve a sign-in code
 * @param code The sign-in code to validate
 * @returns The StudentSignInCode with user, or null if invalid
 */
export async function validateSignInCode(code: string): Promise<(StudentSignInCode & { user: any }) | null> {
  const normalizedCode = normalizeSignInCode(code);

  const signInCodeRecord = await prisma.studentSignInCode.findFirst({
    where: {
      code: normalizedCode,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      user: true,
    },
  });

  return signInCodeRecord;
}
