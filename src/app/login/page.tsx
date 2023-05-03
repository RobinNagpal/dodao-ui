'use client';

import ButtonLarge from '@/components/core/button/ButtonLarge';
import SingleSectionModal from '@/components/core/modal/SingleSectionModal';
import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';

function LoginButtons() {
  const { loginWithMetamask, loginWithCoinbase, loginWithGoogle, loginWithDiscord, loginWithEmailPassword, logout, session, status, active } = useAuth();
  return (
    <div className="flex-col">
      <div className="mt-2">
        <ButtonLarge variant={'contained'} primary onClick={loginWithMetamask}>
          Login with Metamask
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'contained'} primary onClick={loginWithCoinbase}>
          Login with Coinbase
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'contained'} primary onClick={loginWithGoogle}>
          Login with Google
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'contained'} primary onClick={loginWithDiscord}>
          Login with Discord
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'contained'} primary onClick={() => loginWithEmailPassword('email@example.com', 'password123')}>
          Login with Email/Password
        </ButtonLarge>
      </div>
    </div>
  );
}

function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const { loginWithMetamask, loginWithCoinbase, loginWithGoogle, loginWithDiscord, loginWithEmailPassword, logout, session, status, active } = useAuth();

  return (
    <div className="w-full flex justify-center">
      <div>
        <LoginButtons />
        <div className="flex-col">
          {session && <p>Welcome, {session?.user?.email}</p>}
          {session && <p>Session, {JSON.stringify(session || {})}</p>}
          {status && <p>Status, {status}</p>}
          {active && <p>Connected with Web3</p>}
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
