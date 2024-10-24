'use client';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import { ByteCollection, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import { CreateByteCollectionRequest } from '@/types/request/ByteCollectionRequests';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

export default function AddByteCollection({ space }: { space: SpaceWithIntegrationsFragment }) {
  const [showAddCollectionModal, setShowAddCollectionModal] = React.useState(false);

  const { postData } = useFetchUtils();
  function onClose() {
    setShowAddCollectionModal(false);
  }

  async function upsertByteCollectionFn(byteCollection: EditByteCollection) {
    await postData<ByteCollection, CreateByteCollectionRequest>(
      `${getBaseUrl()}/api/${space.id}/byte-collections`,
      {
        name: byteCollection.name,
        description: byteCollection.description,
        priority: byteCollection.priority,
        videoUrl: byteCollection.videoUrl,
      },
      {
        redirectPath: `/?updated=${Date.now()}`,
        successMessage: 'Tidbit collection created successfully',
        errorMessage: 'Failed to create tidbit collection',
      }
    );
  }

  return (
    <>
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
      </div>

      {showAddCollectionModal && (
        <FullScreenModal open={true} onClose={onClose} title={'Create Tidbit Collection'}>
          <div className="text-left">
            <PageWrapper>
              <SingleCardLayout>
                <ByteCollectionEditor space={space} byteCollection={undefined} viewByteCollectionsUrl={'/'} upsertByteCollectionFn={upsertByteCollectionFn} />
              </SingleCardLayout>
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}
    </>
  );
}
