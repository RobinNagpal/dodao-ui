import ButtonLarge from '@/components/core/button/ButtonLarge';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

export function LoginButtons() {
  const { loginWithMetamask, loginWithCoinbase, loginWithGoogle, loginWithDiscord, loginWithEmailPassword, logout, active } = useAuth();
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
