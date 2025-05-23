'use client';

import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useAuth } from '@dodao/web-core/ui/auth/useAuth';
import { useLoginModalContext } from '@dodao/web-core/ui/contexts/LoginModalContext';
import React from 'react';

export default function LoginLogoutButtons(props: { session: Session | null; space: SpaceWithIntegrationsDto }) {
  const { logout, active } = useAuth(props.space!.id);
  const { setShowLoginModal } = useLoginModalContext();

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-y-5">
        {props.session?.username && <p className="font-medium text-lg">Welcome - {props.session?.username}</p>}
        {props.session?.username && (
          <ButtonLarge variant={'contained'} primary onClick={logout}>
            Logout
          </ButtonLarge>
        )}
      </div>
      {!props.session?.username && (
        <div className="mt-4">
          <ButtonLarge onClick={() => setShowLoginModal(true)} primary>
            Show Login Modal
          </ButtonLarge>
        </div>
      )}
    </div>
  );
}
