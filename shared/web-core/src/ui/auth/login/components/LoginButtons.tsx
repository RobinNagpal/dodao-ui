'use client';

import { SpaceWithIntegrationsFragment } from '@dodao/web-core/types/space';
import EmailLoginModal from '@dodao/web-core/ui/auth/login/components/EmailLoginModal';
import withSpace from '@dodao/web-core/ui/auth/withSpace';
import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import { useAuth } from '@dodao/web-core/ui/auth/useAuth';
import { LoginProviders } from '@dodao/web-core/types/deprecated/models/enums';
import React, { useEffect } from 'react';

function LoginButtonsFunction(props: { space: SpaceWithIntegrationsFragment; onCloseEmailModal: () => void }) {
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

  const isEmailEnabled = !!space.authSettings.loginOptions?.includes(LoginProviders.Email);

  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const loginWithEmail = () => {
    setShowEmailModal(true);
  };

  const enabledOptions = [isMetamaskEnabled, isCoinbaseEnabled, isGoogleEnabled, isDiscordEnabled, isNearEnabled, isEmailEnabled];
  const enabledOptionsCount = enabledOptions.filter((x) => x).length;

  useEffect(() => {
    if (enabledOptionsCount === 1) {
      if (isMetamaskEnabled) loginWithMetamask();
      if (isCoinbaseEnabled) loginWithCoinbase();
      if (isGoogleEnabled) loginWithGoogle();
      if (isDiscordEnabled) loginWithDiscord();
      if (isNearEnabled) loginWithNear();
      if (isEmailEnabled) loginWithEmail();
    }
  }, [enabledOptionsCount]);

  console.log({
    isMetamaskEnabled,
    isCoinbaseEnabled,
    isGoogleEnabled,
    isDiscordEnabled,
    isNearEnabled,
    isEmailEnabled,
  });
  return (
    <div className="flex-col max-w-md">
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
      {isEmailEnabled ? (
        <div className="mt-2">
          <ButtonLarge variant={'outlined'} primary onClick={loginWithEmail} className="w-full" disabled={processing} loading={processingNear}>
            Login with Email
          </ButtonLarge>
        </div>
      ) : null}
      {showEmailModal && (
        <EmailLoginModal
          open={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            props.onCloseEmailModal();
          }}
        />
      )}
    </div>
  );
}

export const LoginButtons = withSpace(LoginButtonsFunction);
