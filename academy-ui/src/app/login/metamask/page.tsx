'use client';

import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useAuth } from '@dodao/web-core/ui/auth/useAuth';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useSession } from 'next-auth/react';
import React from 'react';

export default function LoginWithMetamask() {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const { loginWithMetamask, processing, processingMetaMask, logout } = useAuth();
  return (
    <PageWrapper>
      <div className="flex justify-center align-center w-full min-h-screen">
        <div className="w-64">
          <div className="flex-col">
            {session?.username && <p>Welcome - {session?.username}</p>}
            {session?.username && (
              <ButtonLarge variant={'contained'} primary onClick={() => logout()}>
                Logout
              </ButtonLarge>
            )}
          </div>
          {!session?.username && (
            <ButtonLarge variant={'outlined'} primary onClick={loginWithMetamask} className="w-full" disabled={processing} loading={processingMetaMask}>
              Login with Metamask
            </ButtonLarge>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
