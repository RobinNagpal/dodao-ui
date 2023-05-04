'use client';

import { LoginButtons } from '@/app/login/components/LoginButtons';
import ButtonLarge from '@/components/core/button/ButtonLarge';
import SingleSectionModal from '@/components/core/modal/SingleSectionModal';
import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';

function LoginPage({ session }: { session: any }) {
  const [showModal, setShowModal] = useState(false);
  const { logout, active } = useAuth();

  return (
    <div className="w-full flex justify-center">
      <div>
        <LoginButtons />
        <div className="flex-col">
          <p>Welcome, {session?.user?.email}</p>
          <p>Session, {JSON.stringify(session || 'No session')}</p>
          <p>Connected with Web3</p>
          <ButtonLarge variant={'contained'} primary onClick={logout}>
            Logout
          </ButtonLarge>
        </div>
        <div className="mt-4">
          <ButtonLarge onClick={() => setShowModal(true)} primary>
            Show Login Modal
          </ButtonLarge>
          <SingleSectionModal open={showModal} onClose={() => setShowModal(false)} title={'Login'}>
            <LoginButtons />
          </SingleSectionModal>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
