'use client';

import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useAuth } from '@dodao/web-core/ui/auth/useAuth';
import React from 'react';

export default function LoginLogoutWithMetamask(props: { session: Session | null; space: SpaceWithIntegrationsDto }) {
  const { loginWithMetamask, processing, processingMetaMask, logout } = useAuth(props.space!.id);

  return (
    <div className="w-64">
      <div className="flex-col">
        {props.session?.username && <p>Welcome - {props.session?.username}</p>}
        {props.session?.username && (
          <ButtonLarge variant={'contained'} primary onClick={logout}>
            Logout
          </ButtonLarge>
        )}
      </div>
      {!props.session?.username && (
        <div className="mt-4">
          <ButtonLarge variant={'outlined'} primary onClick={loginWithMetamask} className="w-full" disabled={processing} loading={processingMetaMask}>
            Login with Metamask
          </ButtonLarge>
        </div>
      )}
    </div>
  );
}
