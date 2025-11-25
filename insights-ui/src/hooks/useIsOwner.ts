import { useSession } from 'next-auth/react';
import { KoalaGainsSession } from '@/types/auth';

/**
 * Custom hook to check if the current user is the owner of a resource
 * @param userId - The user ID to compare against the current session user
 * @returns true if the current user is the owner, false otherwise
 */
export function useIsOwner(userId: string | undefined | null): boolean {
  const { data: session } = useSession();
  const koalaSession = session as KoalaGainsSession | null;

  return koalaSession?.userId === userId;
}
