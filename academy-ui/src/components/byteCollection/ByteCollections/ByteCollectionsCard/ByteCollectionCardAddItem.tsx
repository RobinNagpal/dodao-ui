'use client';

import EditByteView from '@/components/bytes/Edit/EditByteView';
import EditClickableDemo from '@/components/clickableDemos/Create/EditClickableDemo';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';
import CursorArrowRipple from '@heroicons/react/24/solid/CursorArrowRippleIcon';
import VideoCameraIcon from '@heroicons/react/24/solid/VideoCameraIcon';

export default function CreateContentModalContents({
  hideModal,
  space,
  byteCollection,
}: {
  hideModal: () => void;
  space: SpaceWithIntegrationsDto;
  byteCollection: ByteCollectionSummary;
}) {
  const [showCreateTidbitModal, setShowCreateTidbitModal] = useState<boolean>(false);
  const [showCreateVideoModal, setShowCreateVideoModal] = useState<boolean>(false);
  const [showCreateDemoModal, setShowCreateDemoModal] = useState<boolean>(false);
  const router = useRouter();

  function onClose() {
    setShowCreateTidbitModal(false);
    setShowCreateDemoModal(false);
    setShowCreateVideoModal(false);
    router.refresh();
  }

  return (
    <>
      <div className="pt-4 flex flex-col justify-center items-center w-full h-max">
        <div className="p-4 mb-[100%] sm:mb-0">
          <Button variant="outlined" primary className="p-2 w-2/3 mb-2" onClick={() => setShowCreateTidbitModal(true)}>
            <Bars3BottomLeftIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Create Tidbit
          </Button>
          <Button variant="outlined" primary className="p-2 w-2/3 mb-2" onClick={() => setShowCreateVideoModal(true)}>
            <VideoCameraIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Create Short Video
          </Button>
          <Button variant="outlined" primary className="p-2 w-2/3" onClick={() => setShowCreateDemoModal(true)}>
            <CursorArrowRipple className="h-5 w-5 mr-2" aria-hidden="true" />
            Create Clickable Demo
          </Button>
        </div>
      </div>
      {showCreateTidbitModal && (
        <FullScreenModal open={true} onClose={onClose} title={'Create Tidbit'}>
          <div className="text-left">
            <EditByteView
              space={space}
              byteCollection={byteCollection}
              onUpsert={async (byteId) => {
                router.push(`/tidbit-collections/view/${byteCollection.id}/${byteId}`);
              }}
            />
          </div>
        </FullScreenModal>
      )}

      {showCreateDemoModal && (
        <FullScreenModal open={true} onClose={onClose} title={'Create Clickable Demo'}>
          <div className="text-left">
            <EditClickableDemo demoId={null} byteCollection={byteCollection} />
          </div>
        </FullScreenModal>
      )}

      {showCreateVideoModal && (
        <FullScreenModal open={true} onClose={onClose} title={'Create Short Video'}>
          <div className="text-left">
            <PageWrapper>
              <EditShortVideoView
                space={space}
                byteCollection={byteCollection}
                onCancel={() => {
                  router.push('/tidbit-collections');
                  setShowCreateVideoModal(false);
                }}
              />
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}
    </>
  );
}
