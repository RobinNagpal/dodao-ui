'use client';

import React from 'react';
import ButtonLarge from '@dodao/web-core/components/core/buttons/Button';
import EmailSetupNewSpaceModal from '@dodao/web-core/ui/auth/signup/components/EmailSetupNewSpaceModal';
import { BaseSpace } from '@prisma/client';

interface HomepageProps {
  space: BaseSpace;
}

function Homepage({ space }: HomepageProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <ButtonLarge type="button" variant="contained" primary onClick={() => setOpen(true)} className="px-6 py-4 font-semibold">
          Get Started
        </ButtonLarge>
        <EmailSetupNewSpaceModal open={open} onClose={() => setOpen(false)} space={space!} />
      </div>
    </>
  );
}

export default Homepage;
