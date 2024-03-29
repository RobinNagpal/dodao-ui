'use client';

import EmailLoginModal from '@/app/login/components/EmailLoginModal';
import withSpace from '@/app/withSpace';
import ButtonLarge from '@/components/core/buttons/Button';
import { SpaceTypes, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useAuth } from '@/hooks/useAuth';
import { LoginProviders } from '@/types/deprecated/models/enums';
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

  const isTidbitSite = space?.type === SpaceTypes.TidbitsSite;

  const allOptionsEnabled = !isTidbitSite && (space.authSettings.loginOptions?.length || 0) === 0;

  const isMetamaskEnabled = !isTidbitSite && !!space.authSettings.loginOptions?.includes(LoginProviders.MetaMask);
  const isCoinbaseEnabled = !isTidbitSite && !!space.authSettings.loginOptions?.includes(LoginProviders.Coinbase);
  const isGoogleEnabled = !isTidbitSite && !!space.authSettings.loginOptions?.includes(LoginProviders.Google);
  const isDiscordEnabled = !isTidbitSite && !!space.authSettings.loginOptions?.includes(LoginProviders.Discord);
  const isNearEnabled = !isTidbitSite && !!space.authSettings.loginOptions?.includes(LoginProviders.Near);

  const isEmailEnabled = isTidbitSite || !!space.authSettings.loginOptions?.includes(LoginProviders.Email);

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
