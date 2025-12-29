import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

/**
 * Verifies that a record belongs to the specified user and space
 * @param model - The Prisma model to query
 * @param id - The record ID to verify
 * @param userId - The user ID to check ownership
 * @param errorMessage - The error message to throw if record not found
 * @param include - Optional include options for the query
 * @returns The found record
 */
export async function verifyUserRecordOwnership(model: any, id: string, userId: string, errorMessage: string, include?: any): Promise<any> {
  if (!id) {
    throw new Error('ID is required');
  }

  // Verify the record belongs to the user
  const existingRecord = await model.findFirst({
    where: {
      id: id,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    ...(include && { include }),
  });

  if (!existingRecord) {
    throw new Error(errorMessage);
  }

  return existingRecord;
}
