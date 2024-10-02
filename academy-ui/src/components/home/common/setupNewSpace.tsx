'use client';

import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import EmailSetupNewSpaceModal from '@dodao/web-core/ui/auth/signup/components/EmailSetupNewSpaceModal';

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
