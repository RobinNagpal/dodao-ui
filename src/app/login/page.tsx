'use client';

import ButtonLarge from '@/components/core/buttons/Button';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from 'next-auth/react';
import React from 'react';

function LoginPage() {
  const { data: session } = useSession();
  const { logout, active } = useAuth();
  const { setShowLoginModal } = useLoginModalContext();

  return (
    <PageWrapper>
      <div className="w-full flex justify-center break-all">
        <div>
          <div className="flex-col">
            <p>Welcome - {session?.username}</p>
            <p>Session - {session ? JSON.stringify(session, null, 2) : 'No session'}</p>
            <p>Connected with Web3</p>
            <ButtonLarge variant={'contained'} primary onClick={logout}>
              Logout
            </ButtonLarge>
          </div>
          <div className="mt-4">
            <ButtonLarge onClick={() => setShowLoginModal(true)} primary>
              Show Login Modal
            </ButtonLarge>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default LoginPage;
