import { PredefinedSpaces } from '@/chatbot/utils/app/constants';
import Button from '@/components/core/buttons/Button';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import UpsertProjectModal from '@/components/projects/Edit/UpsertProjectModal';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function CreateContentModalContents({ hideModal, space }: { hideModal: () => void; space?: SpaceWithIntegrationsFragment | null }) {
  const router = useRouter();
  const [showProjectAddModal, setShowProjectAddModal] = useState(false);
  const goToUrl = (url: string) => {
    router.push(url);
    hideModal();
  };
  return (
    <div className="pt-4 flex flex-col justify-center items-center w-full h-max">
      <div className="p-4 mb-[100%] sm:mb-0">
        <Grid2Cols>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/tidbits/edit')}>
            Create Tidbit
          </Button>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/guides/edit')}>
            Create Guide
          </Button>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/timelines/edit')}>
            Create timeline
          </Button>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/tidbit-collections/edit')}>
            Create Tidbit Collection
          </Button>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/tidbit-collection-categories/edit')}>
            Create Tidbit Collection Category
          </Button>
          <Button variant="outlined" primary className="p-2 w-full" onClick={() => goToUrl('/shorts/create')}>
            Create Short Video
          </Button>
          {space?.id === PredefinedSpaces.CRYPTO_GELATO && (
            <Button variant="outlined" primary className="p-2 w-full" onClick={() => setShowProjectAddModal(true)}>
              Create Project
            </Button>
          )}
        </Grid2Cols>
        {space && showProjectAddModal && <UpsertProjectModal spaceId={space.id} open={showProjectAddModal} onClose={() => setShowProjectAddModal(false)} />}
      </div>
    </div>
  );
}
