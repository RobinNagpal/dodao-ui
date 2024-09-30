'use client';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import EmailSetupNewSpaceModal from '../TidbitsHub/components/EmailSetupNewSpaceModal';
import React from 'react';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export interface setupNewSpaceButtonProps {
  space: SpaceWithIntegrationsFragment;
}

export function SetupNewSpaceButton({ space }: setupNewSpaceButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <ButtonLarge type="button" variant="contained" primary onClick={() => setOpen(true)} className="px-6 py-4 font-semibold">
        Get Started
      </ButtonLarge>
      <EmailSetupNewSpaceModal open={open} onClose={() => setOpen(false)} space={space!} />
    </>
  );
}
