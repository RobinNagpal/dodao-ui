import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SimulationSession } from '@/types/user';
import { logoutUser } from '@/utils/auth-utils';
import { UserRole } from '@prisma/client';

type AllowedRoles = UserRole | UserRole[] | 'any';

export interface UseAuthCheckOptions {
  /**
   * Roles that are allowed to access this component
   * - 'any' means any authenticated user
   * - Single role string or array of roles
   */
  allowedRoles?: AllowedRoles;
}

interface UseAuthCheckReturn {
  session: SimulationSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthorized: boolean | null;
}

/**
 * Hook to check user authentication and authorization
 * Handles session loading, role checking, and automatic logout for unauthorized users
 */
export function useAuthCheck(options: UseAuthCheckOptions = {}): UseAuthCheckReturn {
  const { allowedRoles = 'any' } = options;
  const { data: simSession, status: sessionStatus } = useSession();
  const session: SimulationSession | null = simSession as SimulationSession | null;
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Still loading session
    if (sessionStatus === 'loading') {
      return;
    }

    // No session - unauthorized
    if (!session) {
      setIsAuthorized(false);
      logoutUser();
      return;
    }

    // Check role authorization
    if (allowedRoles !== 'any') {
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const hasRequiredRole = rolesArray.includes(session.role);

      if (!hasRequiredRole) {
        setIsAuthorized(false);
        logoutUser();
        return;
      }
    }

    // Authorized
    setIsAuthorized(true);
  }, [session, sessionStatus, allowedRoles]);

  return {
    session,
    status: sessionStatus,
    isAuthorized,
  };
}
