import Button from '@dodao/web-core/components/core/buttons/Button';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function CreateByteCollectionItemModal({
  hideModal,
  space,
}: {
  hideModal: () => void;
  space?: SpaceWithIntegrationsFragment | null;
  byteCollectionId?: String;
}) {
  const router = useRouter();
  const goToUrl = (url: string) => {
    router.push(url);
    hideModal();
  };
  return (
    <div className="pt-4 flex flex-col justify-center items-center w-full h-max">
      <div className="p-4 mb-[100%] sm:mb-0">
        <Button variant="outlined" primary className="p-2 w-2/3 mb-3" onClick={() => goToUrl('/tidbits/edit')}>
          Create Tidbit
        </Button>
        <Button variant="outlined" primary className="p-2 w-2/3 mb-3" onClick={() => goToUrl('/shorts/create')}>
          Create Short Video
        </Button>
        <Button variant="outlined" primary className="p-2 w-2/3" onClick={() => goToUrl('/clickable-demos/edit')}>
          Create Clickable Demo
        </Button>
      </div>
    </div>
  );
}
