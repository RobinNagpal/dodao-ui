import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { KoalaGainsSession } from '@/types/auth';
import { getServerSession } from 'next-auth/next';

/**
 * True when the current request's session belongs to an Admin. Server-only
 * (reads the session cookie from the ambient request); the client-side check
 * lives in `./isAdmin.ts`.
 */
export async function isAdminServerSession(): Promise<boolean> {
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | null;
  return session?.role === 'Admin';
}
