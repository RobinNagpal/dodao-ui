'use client';

import Button from '@dodao/web-core/components/core/buttons/Button';
import { SpaceWithIntegrationsFragment, ByteCollectionFragment } from '@/graphql/generated/generated-types';
import EditByteView from '@/components/bytes/Edit/EditByteView';
import EditClickableDemo from '@/components/clickableDemos/Create/EditClickableDemo';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateContentModalContents({
  hideModal,
  space,
  byteCollection,
}: {
  hideModal: () => void;
  space: SpaceWithIntegrationsFragment;
  byteCollection: ByteCollectionFragment;
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
            Create Tidbit
          </Button>
          <Button variant="outlined" primary className="p-2 w-2/3 mb-2" onClick={() => setShowCreateVideoModal(true)}>
            Create Short Video
          </Button>
          <Button variant="outlined" primary className="p-2 w-2/3" onClick={() => setShowCreateDemoModal(true)}>
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
                router.push(`/tidbits/view/${byteId}`);
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
