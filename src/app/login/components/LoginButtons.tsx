'use client';

import withSpace from '@/app/withSpace';
import ButtonLarge from '@/components/core/buttons/Button';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useAuth } from '@/hooks/useAuth';
import { LoginProviders } from '@/types/deprecated/models/enums';
import React from 'react';

function LoginButtonsFunction(props: { space: SpaceWithIntegrationsFragment }) {
  const { space } = props;
  const {
    loginWithMetamask,
    loginWithCoinbase,
    loginWithGoogle,
    loginWithDiscord,
    loginWithNear,

    processing,
    processingMetaMask,
    processingCoinbase,
    processingGoogle,
    processingDiscord,
    processingNear,
  } = useAuth();
  const allOptionsEnabled = (space.authSettings.loginOptions?.length || 0) === 0;
  const isMetamaskEnabled = !!space.authSettings.loginOptions?.includes(LoginProviders.MetaMask);
  const isCoinbaseEnabled = !!space.authSettings.loginOptions?.includes(LoginProviders.Coinbase);
  const isGoogleEnabled = !!space.authSettings.loginOptions?.includes(LoginProviders.Google);
  const isDiscordEnabled = !!space.authSettings.loginOptions?.includes(LoginProviders.Discord);

  const isNearEnabled = !!space.authSettings.loginOptions?.includes(LoginProviders.Near);
  return (
    <div className="flex-col">
      {allOptionsEnabled || isMetamaskEnabled ? (
        <div className="mt-2 w-full">
          <ButtonLarge variant={'outlined'} primary onClick={loginWithMetamask} className="w-full" disabled={processing} loading={processingMetaMask}>
            Login with Metamask
          </ButtonLarge>
        </div>
      ) : null}
      {allOptionsEnabled || isCoinbaseEnabled ? (
        <div className="mt-2">
          <ButtonLarge variant={'outlined'} primary onClick={loginWithCoinbase} className="w-full" disabled={processing} loading={processingCoinbase}>
            Login with Coinbase
          </ButtonLarge>
        </div>
      ) : null}
      {allOptionsEnabled || isGoogleEnabled ? (
        <div className="mt-2">
          <ButtonLarge variant={'outlined'} primary onClick={loginWithGoogle} className="w-full" disabled={processing} loading={processingGoogle}>
            Login with Google
          </ButtonLarge>
        </div>
      ) : null}
      {allOptionsEnabled || isDiscordEnabled ? (
        <div className="mt-2">
          <ButtonLarge variant={'outlined'} primary onClick={loginWithDiscord} className="w-full" disabled={processing} loading={processingDiscord}>
            Login with Discord
          </ButtonLarge>
        </div>
      ) : null}
      {isNearEnabled ? (
        <div className="mt-2">
          <ButtonLarge variant={'outlined'} primary onClick={loginWithNear} className="w-full" disabled={processing} loading={processingNear}>
            Login with NEAR
          </ButtonLarge>
        </div>
      ) : null}
    </div>
  );
}

export const LoginButtons = withSpace(LoginButtonsFunction);
