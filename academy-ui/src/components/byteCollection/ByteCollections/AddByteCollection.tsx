'use client';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import ByteCollectionEditor from '@/components/byteCollection/ByteCollections/ByteCollectionEditor';
import { EditByteCollection } from '@/components/byteCollection/ByteCollections/useEditByteCollection';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import SingleCardLayout from '@/layouts/SingleCardLayout';
import PageLoading from '@dodao/web-core/components/core/loaders/PageLoading';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useRouter } from 'next/navigation';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

export default function AddByteCollection({ space }: { space: SpaceWithIntegrationsFragment }) {
  const [showAddCollectionModal, setShowAddCollectionModal] = React.useState(false);
  const { showNotification } = useNotificationContext();
  const router = useRouter();

  function onClose() {
    setShowAddCollectionModal(false);
    router.refresh();
  }

  async function upsertByteCollectionFn(byteCollection: EditByteCollection) {
    try {
      const result = await fetch('/api/byte-collection/create-byte-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            spaceId: space.id,
            name: byteCollection.name,
            description: byteCollection.description,
            byteIds: [],
            status: byteCollection.status,
            priority: byteCollection.priority,
            videoUrl: byteCollection.videoUrl,
          },
        }),
      });

      if (result.ok) {
        showNotification({ message: 'Collection Created Successfully', type: 'success' });
        setShowAddCollectionModal(false);
      }
    } catch (error) {
      showNotification({ message: 'Something went wrong', type: 'error' });
    }
  }

  return (
    <>
      <div className="w-full flex items-center justify-center">
        <Button
          className="w-full rounded-lg bg-white text-color"
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
                <ByteCollectionEditor
                  space={space}
                  byteCollection={undefined}
                  viewByteCollectionsUrl={'/tidbit-collections'}
                  upsertByteCollectionFn={upsertByteCollectionFn}
                />
              </SingleCardLayout>
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}
    </>
  );
}
