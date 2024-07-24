import Button from '@dodao/web-core/components/core/buttons/Button';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

export default function CreateContentModalContents({ hideModal, space }: { hideModal: () => void; space?: SpaceWithIntegrationsFragment | null }) {
  return (
    <div className="pt-4 flex flex-col justify-center items-center w-full h-max">
      <div className="p-4 mb-[100%] sm:mb-0">
        <Button variant="outlined" primary className="p-2 w-2/3 mb-2">
          Create Tidbit
        </Button>
        <Button variant="outlined" primary className="p-2 w-2/3 mb-2">
          Create Short Video
        </Button>
        <Button variant="outlined" primary className="p-2 w-2/3">
          Create Clickable Demo
        </Button>
      </div>
    </div>
  );
}
