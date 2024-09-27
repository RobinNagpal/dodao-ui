'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import EmailSignupModal from '../TidbitsHub/components/EmailSignupModal';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export interface SignupButtonProps {
  space: SpaceWithIntegrationsFragment;
}

export function SignupButton({ space }: SignupButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ButtonLarge type="button" variant="contained" primary onClick={() => setOpen(true)} className="px-6 py-4 font-semibold">
        Get Started
      </ButtonLarge>
      <EmailSignupModal open={open} onClose={() => setOpen(false)} space={space!} />
    </>
  );
}
