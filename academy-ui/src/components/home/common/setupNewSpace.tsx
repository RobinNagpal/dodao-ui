'use client';

import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import EmailSetupNewSpaceModal from '@dodao/web-core/ui/auth/signup/components/EmailSetupNewSpaceModal';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';

export interface setupNewSpaceButtonProps {
  space: SpaceWithIntegrationsFragment;
}

export function SetupNewSpaceButton({ space }: setupNewSpaceButtonProps) {
  const [open, setOpen] = React.useState(false);
  const { data: session } = useSession() as { data: Session | null };

  const router = useRouter();

  const handleButtonClick = async () => {
    if (session) {
      router.push('/spaces/space-collections');
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <ButtonLarge type="button" variant="contained" primary onClick={handleButtonClick} className="px-6 py-4 font-semibold">
        Get Started
      </ButtonLarge>
      <EmailSetupNewSpaceModal open={open} onClose={() => setOpen(false)} space={space!} />
    </>
  );
}
