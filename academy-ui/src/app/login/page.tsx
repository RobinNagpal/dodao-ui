'use client';

import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { useAuth } from '@/hooks/useAuth';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useSession } from 'next-auth/react';
import React from 'react';

function LoginPage() {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const { logout, active } = useAuth();
  const { setShowLoginModal } = useLoginModalContext();

  return (
    <PageWrapper>
      <div className="w-full flex justify-center break-all">
        <div>
          <div className="flex-col">
            {session?.username && <p>Welcome - {session?.username}</p>}
            {session?.username && (
              <ButtonLarge variant={'contained'} primary onClick={logout}>
                Logout
              </ButtonLarge>
            )}
          </div>
          {!session?.username && (
            <div className="mt-4">
              <ButtonLarge onClick={() => setShowLoginModal(true)} primary>
                Show Login Modal
              </ButtonLarge>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
