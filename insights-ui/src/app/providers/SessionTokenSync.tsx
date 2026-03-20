'use client';

import { Session } from '@dodao/web-core/types/auth/Session';
import { DODAO_ACCESS_TOKEN_KEY } from '@dodao/web-core/types/deprecated/models/enums';
import { setDoDAOTokenInLocalStorage } from '@dodao/web-core/utils/auth/setDoDAOTokenInLocalStorage';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * Keeps localStorage in sync with the NextAuth session's dodaoAccessToken.
 * This is necessary because OAuth flows (e.g. Google) perform a full-page
 * redirect and there is no post-redirect callback to store the token manually
 * (unlike the custom-email flow which does it in LoginTokenVerificationPage).
 */
export default function SessionTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      setDoDAOTokenInLocalStorage(session as Session);
    } else if (status === 'unauthenticated') {
      try {
        localStorage.removeItem(DODAO_ACCESS_TOKEN_KEY);
      } catch {
        // localStorage may not be available (SSR)
      }
    }
  }, [session, status]);

  return null;
}
