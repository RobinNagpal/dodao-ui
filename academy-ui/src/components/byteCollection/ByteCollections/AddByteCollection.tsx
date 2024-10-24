'use client';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React from 'react';

export default function AddByteCollection({ space }: { space: SpaceWithIntegrationsFragment }) {
  const [showAddCollectionModal, setShowAddCollectionModal] = React.useState(false);

  function onClose() {
    setShowAddCollectionModal(false);
  }

  return (
    <div className="w-full flex justify-center">
      <Button
        className="w-full bg-white text-color font-semibold"
        variant="outlined"
        primary
        style={{ border: '2px dotted', height: '10rem', letterSpacing: '0.05em', borderRadius: '0.5rem' }}
        onClick={() => setShowAddCollectionModal(true)}
      >
        + Add Tidbit Collection
      </Button>
      {showAddCollectionModal && (
        <FullScreenModal open={true} onClose={onClose} title={'Create Tidbit Collection'}>
          <div className="text-left">
            <PageWrapper>
              <SingleCardLayout>
                <ByteCollectionEditor space={space} byteCollection={undefined} viewByteCollectionsUrl={'/'} />
              </SingleCardLayout>
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}
    </div>
  );
}
