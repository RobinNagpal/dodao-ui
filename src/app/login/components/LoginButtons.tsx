import ButtonLarge from '@/components/core/buttons/Button';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

export function LoginButtons() {
  const {
    loginWithMetamask,
    loginWithCoinbase,
    loginWithGoogle,
    loginWithDiscord,

    processing,
    processingMetaMask,
    processingCoinbase,
    processingGoogle,
    processingDiscord,
  } = useAuth();
  return (
    <div className="flex-col">
      <div className="mt-2 w-full">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithMetamask} className="w-full" disabled={processing} loading={processingMetaMask}>
          Login with Metamask
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithCoinbase} className="w-full" disabled={processing} loading={processingCoinbase}>
          Login with Coinbase
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithGoogle} className="w-full" disabled={processing} loading={processingGoogle}>
          Login with Google
        </ButtonLarge>
      </div>
      <div className="mt-2">
        <ButtonLarge variant={'outlined'} primary onClick={loginWithDiscord} className="w-full" disabled={processing} loading={processingDiscord}>
          Login with Discord
        </ButtonLarge>
      </div>
    </div>
  );
}
