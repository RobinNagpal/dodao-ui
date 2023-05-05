import ButtonLarge from '@/components/core/button/ButtonLarge';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

export function LoginButtons() {
  const { loginWithMetamask, loginWithCoinbase, loginWithGoogle, loginWithDiscord, loginWithEmailPassword, logout, active } = useAuth();
  return (
    <div className="flex-col">
      <div className="mt-2 w-full">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithMetamask} className="w-full">
          Login with Metamask
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithCoinbase} className="w-full">
          Login with Coinbase
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithGoogle} className="w-full">
          Login with Google
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithDiscord} className="w-full">
          Login with Discord
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'outlined'} primary onClick={() => loginWithEmailPassword('email@example.com', 'password123')} className="w-full">
          Login with Email/Password
        </ButtonLarge>
      </div>
    </div>
  );
}
